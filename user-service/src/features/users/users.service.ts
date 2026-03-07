import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { IUsersRepository } from './users-repository.adapter';
import { CreateUserDto } from './dto/create-user.dto';
import { IRefreshTokenRepository } from '../../auth/refresh-token-repository.adapter';
import { UpdateUserDto } from './dto/update-user.dto';
import { RecoverUserDto } from './dto/recover-user.dto';
import { RecreateUserDto } from './dto/recreate-user.dto';
import * as bcrypt from 'bcrypt';
import { GiveAdminDto } from './dto/give-admin.dto';
import { RoleEnum } from '../../common/enums/role.enum';
import { UserDto } from '../../common/dtos/user-public.dto';
import { GetActiveUsersDto } from './dto/get-active-users.dto';
import { IAvatarRepository } from '../avatar/avatar-repository.adapter';
import { RedisService } from '../../providers/databases/redis/redis.service';
import { IncreaseBalanceDto } from './dto/increase-balance.dto';
import { DecreaseBalanceDto } from './dto/decrease-balance.dto';
import { TransferMoneyDto } from './dto/transfer-money.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersService {
  logger = new Logger(UsersService.name, { timestamp: true });

  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly avatarRepository: IAvatarRepository,
    private readonly redisService: RedisService,
    private readonly dataSource: DataSource,
  ) {}

  async getAllExistingUsers(): Promise<UserDto[]> {
    const cachedKey = 'users:all';
    const cached = await this.redisService.get<UserDto[]>(cachedKey);
    if (cached) {
      return cached;
    }

    const users = await this.usersRepository.getAllExistingUsers();
    await this.redisService.set(cachedKey, users, 30);
    return users;
  }

  async findUserById(userId: string): Promise<UserDto | null> {
    const cachedKey = `users:${userId}`;
    const cached = await this.redisService.get<UserDto | null>(cachedKey);
    if (cached) {
      return cached;
    }

    const user = await this.usersRepository.findUserById(userId);
    await this.redisService.set(cachedKey, user, 30);
    return user;
  }

  async createUser(createUserData: CreateUserDto): Promise<UserDto | null> {
    await this.redisService.del('users:all');

    return this.usersRepository.createOneUser(createUserData);
  }

  async updateUser(userId: string, updateData: UpdateUserDto): Promise<string> {
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
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async recoverUser(recoverUserData: RecoverUserDto): Promise<string> {
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
  }

  async recreateUser(recreateUserData: RecreateUserDto): Promise<UserDto> {
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
  }

  async getActiveUsers({
    min_age,
    max_age,
  }: GetActiveUsersDto): Promise<UserDto[]> {
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
    } catch (e) {
      throw new BadRequestException(e);
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
    } catch (e) {
      throw new BadRequestException(e);
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
    } catch (e) {
      throw new BadRequestException(e);
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
    } catch (e) {
      throw new BadRequestException(e);
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

      return `transfer from ${senderId} to ${receiverId} executed`;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`transfer failed: ${String(error)}`);
    } finally {
      await queryRunner.release();
    }
  }
}
