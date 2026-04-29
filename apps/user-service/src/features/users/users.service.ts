import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { IUsersRepository } from './users-repository.adapter';
import { CreateUserDto } from './dto/create-user.dto';
import { IRefreshTokenRepository } from '../../auth/refresh-token-repository.adapter';
import { UpdateUserDto } from './dto/update-user.dto';
import { RecoverUserDto } from './dto/recover-user.dto';
import { RecreateUserDto } from './dto/recreate-user.dto';
import * as bcrypt from 'bcrypt';
import { GiveAdminDto } from './dto/give-admin.dto';
import { RoleEnum } from '@app/auth';
import { UserDto } from '../../common/dtos/user-public.dto';
import { GetActiveUsersDto } from './dto/get-active-users.dto';
import { IAvatarRepository } from '../avatar/avatar-repository.adapter';
import { RedisService } from '../../providers/databases/redis/redis.service';
import { IncreaseBalanceDto } from './dto/increase-balance.dto';
import { DecreaseBalanceDto } from './dto/decrease-balance.dto';
import { TransferMoneyDto } from './dto/transfer-money.dto';
import { DataSource } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { TransferCompletedEvent } from './dto/transfer-completed.event';

@Injectable()
export class UsersService implements OnModuleInit {
  logger = new Logger(UsersService.name, { timestamp: true });

  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly avatarRepository: IAvatarRepository,
    private readonly redisService: RedisService,
    private readonly dataSource: DataSource,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.notificationClient.connect();
  }

  async getAllExistingUsers(): Promise<UserDto[]> {
    try {
      const cachedKey = 'users:all';
      const cached = await this.redisService.get<UserDto[]>(cachedKey);
      if (cached) {
        return cached;
      }

      const users = await this.usersRepository.getAllExistingUsers();
      await this.redisService.set(cachedKey, users, 30);
      return users;
    } catch (error) {
      this.logger.error(
        `an error occured when trying to get all existing users`,
        error,
      );
      throw error;
    }
  }

  async findUserById(userId: string): Promise<UserDto | null> {
    try {
      const cachedKey = `users:${userId}`;
      const cached = await this.redisService.get<UserDto | null>(cachedKey);
      if (cached) {
        return cached;
      }

      const user = await this.usersRepository.findUserById(userId);
      await this.redisService.set(cachedKey, user, 30);
      return user;
    } catch (error) {
      this.logger.error(
        `an error occured when trying to find user by id`,
        error,
      );
      throw error;
    }
  }

  async createUser(createUserData: CreateUserDto): Promise<UserDto | null> {
    try {
      await this.redisService.del('users:all');

      return this.usersRepository.createOneUser(createUserData);
    } catch (error) {
      this.logger.error(`an error occured when trying to create user`, error);
      throw error;
    }
  }

  async updateUser(userId: string, updateData: UpdateUserDto): Promise<string> {
    try {
      const cachedKey = `users:${userId}`;
      await this.redisService.del(cachedKey);
      await this.redisService.del('users:all');

      const user = await this.usersRepository.findUserByIdWithDeleted(userId);
      if (!user || user.deletedAt) {
        throw new BadRequestException('user not found');
      }

      const updateRelust = await this.usersRepository.updateUser(
        userId,
        updateData,
      );

      if (!updateRelust.affected) {
        throw new BadRequestException('nothing to update');
      }
      return `update completed, updated colums: ${updateRelust.affected}`;
    } catch (error) {
      this.logger.error(`an error occured when trying to update user`, error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<string> {
    try {
      const cachedKey = `users:${userId}`;
      await this.redisService.del(cachedKey);
      await this.redisService.del('users:all');

      const user = await this.usersRepository.findUserByIdWithDeleted(userId);
      if (!user || user.deletedAt) {
        throw new BadRequestException('user not found');
      }
      const deletedResult =
        await this.usersRepository.deleteOneUserById(userId);
      if (!deletedResult.affected) {
        return 'user not affected';
      }
      const refreshTokenDeleted =
        await this.refreshTokenRepository.deleteRefreshTokenByUserId(userId);
      if (!refreshTokenDeleted.affected) {
        return 'refresh token didnt deleted';
      }
      return 'user deleted, refresh token deleted';
    } catch (error) {
      this.logger.error(`an error occured when trying to delete user`, error);
      throw error;
    }
  }

  async recoverUser(recoverUserData: RecoverUserDto): Promise<string> {
    try {
      await this.redisService.del('users:all');

      //add number verification
      const user = await this.usersRepository.findUserByPhoneWithDeleted(
        recoverUserData.phone,
      );
      if (!user) {
        throw new BadRequestException('user not found');
      }
      if (!user.deletedAt) {
        throw new BadRequestException('user already exists');
      }

      const recoveredUser =
        await this.usersRepository.recoverUser(recoverUserData);
      if (!recoveredUser.affected) {
        throw new InternalServerErrorException('couldnt recover user');
      }

      return `user ${user.login} recovered`;
    } catch (error) {
      this.logger.error(`an error occured when trying to recreate user`, error);
      throw error;
    }
  }

  async recreateUser(recreateUserData: RecreateUserDto): Promise<UserDto> {
    try {
      await this.redisService.del('users:all');

      const { login, phone, age, bio } = recreateUserData;
      const user = await this.usersRepository.findUserByPhoneWithDeleted(phone);
      if (!user) {
        throw new BadRequestException('user not found');
      }
      if (!user.deletedAt) {
        throw new BadRequestException('user already exists');
      }

      const deletedUser =
        await this.usersRepository.deleteOneUserHardByPhone(phone);
      if (deletedUser.affected !== 1) {
        throw new InternalServerErrorException('couldnt delete user');
      }

      //add number verification
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(recreateUserData.password, salt);

      recreateUserData = { login, phone, password: hashedPassword, age, bio };
      return this.usersRepository.recreateUser(recreateUserData);
    } catch (error) {
      this.logger.error(`an error occured when trying to recreate suer`, error);
      throw error;
    }
  }

  async getActiveUsers({
    min_age,
    max_age,
  }: GetActiveUsersDto): Promise<UserDto[]> {
    try {
      const activeUsers = await this.usersRepository.getActiveUsers(
        min_age,
        max_age,
      );
      const userIds = activeUsers.map((u) => u.id);

      const avatars = await this.avatarRepository.findGroupByIds(userIds);
      if (avatars.length === 0) {
        throw new BadRequestException('avatar not found');
      }

      return activeUsers.map((user) => ({
        ...user,
        avatar: avatars.find((a) => a.userId === user.id),
      }));
    } catch (error) {
      this.logger.error(
        `an error occured when trying to get active users`,
        error,
      );
      throw error;
    }
  }

  //admin method
  getAll(): Promise<UserDto[]> {
    return this.usersRepository.getAllUsers();
  }

  //admin method
  async deleteUserHard(userId: string): Promise<string> {
    try {
      const cachedKey = `users:${userId}`;
      await this.redisService.del(cachedKey);

      const user = await this.usersRepository.findUserByIdWithDeleted(userId);
      if (!user) {
        throw new BadRequestException('user not found');
      }
      if (user.deletedAt) {
        this.logger.warn('user was already softly deleted');
      }

      const deletedResult =
        await this.usersRepository.deleteOneUserByIdHard(userId);
      if (!deletedResult.affected) {
        return 'user not affected';
      }

      const refreshTokenDeleted =
        await this.refreshTokenRepository.deleteRefreshTokenByUserId(userId);
      if (!refreshTokenDeleted.affected) {
        return 'refresh token didnt deleted';
      }
      return 'user deleted, refresh token deleted';
    } catch (error) {
      this.logger.error(`an error occured when trying to delete user`, error);
      throw error;
    }
  }

  //admin method
  async giveAdmin({ newAdminId }: GiveAdminDto): Promise<string> {
    try {
      const user =
        await this.usersRepository.findUserByIdWithDeleted(newAdminId);
      if (!user || user.deletedAt) {
        throw new BadRequestException('user not found');
      }
      if (user.role === RoleEnum.ADMIN) {
        throw new BadRequestException(`user '${newAdminId}' is already admin`);
      }
      const updated = await this.usersRepository.giveAdmin(newAdminId);
      if (!updated.affected) {
        return 'couldnt update user';
      }
      return `update completed, updated colums: ${updated.affected}`;
    } catch (error) {
      this.logger.error(`an error occured when trying to give admin`, error);
      throw error;
    }
  }

  async increaseBalance(
    { amount }: IncreaseBalanceDto,
    userId: string,
  ): Promise<string> {
    try {
      const updated = await this.usersRepository.increaseBalance(
        userId,
        amount,
      );
      if (!updated.affected) {
        throw new BadRequestException('user not found');
      }

      return `balance updated`;
    } catch (error) {
      this.logger.error(
        `an error occured when trying to increase balance`,
        error,
      );
      throw error;
    }
  }

  async decreaseBalance(
    { amount }: DecreaseBalanceDto,
    userId: string,
  ): Promise<string> {
    try {
      const updated = await this.usersRepository.decreaseBalance(
        userId,
        amount,
      );
      if (!updated.affected) {
        throw new BadRequestException(
          'user not found or dont have enougth money',
        );
      }
      return 'balance updated';
    } catch (error) {
      this.logger.error(
        `an error occured when trying to decrease balance`,
        error,
      );
      throw error;
    }
  }

  async transferMoney(
    { amount, receiverId }: TransferMoneyDto,
    senderId: string,
  ): Promise<string> {
    if (senderId === receiverId) {
      throw new BadRequestException('self transfers not allowed');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const senderUpdated = await this.usersRepository.decreaseBalance(
        senderId,
        amount,
        queryRunner.manager,
      );

      if (!senderUpdated.affected) {
        throw new BadRequestException(
          'user not found or dont have enougth money',
        );
      }

      const reveiverUpdated = await this.usersRepository.increaseBalance(
        receiverId,
        amount,
        queryRunner.manager,
      );

      if (!reveiverUpdated.affected) {
        throw new BadRequestException('user not found');
      }

      await queryRunner.commitTransaction();

      this.notificationClient.emit(
        'transfer-completed',
        new TransferCompletedEvent(senderId, receiverId, amount),
      );

      return `transfer from ${senderId} to ${receiverId} executed`;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`transfer failed:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
