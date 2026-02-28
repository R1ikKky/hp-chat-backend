import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IUsersRepository } from './users-repository.adapter';
import { CreateUserDto } from './dto/create-user.dto';
import { IRefreshTokenRepository } from '../../auth/dto/refresh-token-repository.interface';
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

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: IUsersRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly avatarRepository: IAvatarRepository,
    private readonly redisService: RedisService,
  ) {}

  async getAllExistingUsers(): Promise<UserDto[]> {
    const cachedKey = 'users:all';
    const cached = await this.redisService.get<UserDto[]>(cachedKey);
    if (cached) {
      return cached;
    }

    const users = await this.userRepository.getAllExistingUsers();
    await this.redisService.set(cachedKey, users, 30);
    return users;
  }

  async findUserById(userId: string): Promise<UserDto | null> {
    const cachedKey = `users:${userId}`;
    const cached = await this.redisService.get<UserDto | null>(cachedKey);
    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findUserById(userId);
    await this.redisService.set(cachedKey, user, 30);
    return user;
  }

  async createUser(createUserData: CreateUserDto): Promise<UserDto | null> {
    await this.redisService.del('users:all');

    return this.userRepository.createOneUser(createUserData);
  }

  async updateUser(userId: string, updateData: UpdateUserDto): Promise<string> {
    const cachedKey = `users:${userId}`;
    await this.redisService.del(cachedKey);
    await this.redisService.del('users:all');

    const user = await this.userRepository.findUserByIdWithDeleted(userId);
    if (!user || user.deletedAt)
      throw new BadRequestException('user not found');
    return this.userRepository.updateUser(userId, updateData);
  }

  async deleteUser(userId: string): Promise<string> {
    const cachedKey = `users:${userId}`;
    await this.redisService.del(cachedKey);
    await this.redisService.del('users:all');

    const user = await this.userRepository.findUserByIdWithDeleted(userId);
    if (!user || user.deletedAt)
      throw new BadRequestException('user not found');
    const userDeleted = await this.userRepository.deleteOneUserById(userId);
    const refreshTokenDeleted =
      await this.refreshTokenRepository.deleteRefreshTokenByUserId(userId);
    return `${userDeleted}, ${refreshTokenDeleted}`;
  }

  async recoverUser(recoverUserData: RecoverUserDto): Promise<string> {
    await this.redisService.del('users:all');

    //add number verification
    const user = await this.userRepository.findUserByPhoneWithDeleted(
      recoverUserData.phone,
    );
    if (!user) throw new BadRequestException('user not found');

    return this.userRepository.recoverUser(recoverUserData);
  }

  async recreateUser(recreateUserData: RecreateUserDto): Promise<UserDto> {
    await this.redisService.del('users:all');

    const { login, phone, age, bio } = recreateUserData;
    //add number verification
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(recreateUserData.password, salt);

    recreateUserData = { login, phone, password: hashedPassword, age, bio };
    return this.userRepository.recreateUser(recreateUserData);
  }

  async getActiveUsers({
    min_age,
    max_age,
  }: GetActiveUsersDto): Promise<UserDto[]> {
    const activeUsers = await this.userRepository.getActiveUsers(
      min_age,
      max_age,
    );
    const userIds = activeUsers.map((u) => u.id);

    const avatars = await this.avatarRepository.findGroupByIds(userIds);
    console.log(activeUsers, avatars);

    return activeUsers.map((user) => ({
      ...user,
      avatar: avatars.find((a) => a.userId === user.id),
    }));
  }

  //admin method
  getAll(): Promise<UserDto[]> {
    return this.userRepository.getAllUsers();
  }

  //admin method
  async deleteUserHard(userId: string): Promise<string> {
    const cachedKey = `users:${userId}`;
    await this.redisService.del(cachedKey);

    const user = await this.userRepository.findUserByIdWithDeleted(userId);
    if (!user) throw new BadRequestException('user not found');
    if (user.deletedAt) Logger.warn('user was already softly deleted');
    const userDeleted = await this.userRepository.deleteOneUserByIdHard(userId);
    const refreshTokenDeleted =
      await this.refreshTokenRepository.deleteRefreshTokenByUserId(userId);
    return `${userDeleted}, ${refreshTokenDeleted}`;
  }

  //admin method
  async giveAdmin(giveAdminData: GiveAdminDto): Promise<string> {
    const userId = giveAdminData.newAdminId;
    const user = await this.userRepository.findUserByIdWithDeleted(userId);
    if (!user || user.deletedAt)
      throw new BadRequestException('user not found');
    if (user.role === RoleEnum.ADMIN)
      throw new BadRequestException(
        `user '${giveAdminData.newAdminId}' is already admin`,
      );
    return this.userRepository.giveAdmin(giveAdminData);
  }
}
