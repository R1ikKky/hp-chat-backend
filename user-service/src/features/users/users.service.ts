import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { IUsersRepository } from './dto/users-repository.interface';
import { UsersEntity } from './entities/user.entity';
import { createUserDto } from './dto/create-user.dto';
import { IRefreshTokenRepository } from '../../auth/dto/refresh-token-repository.interface';
import { updateUserDto } from './dto/update-user.dto';
import { UpdateResult } from 'typeorm';
import { recoverUserDto } from './dto/recover-user.dto';
import { recreateUserDto } from './dto/recreate-user.dto';
import * as bcrypt from 'bcrypt';
import { giveAdminDto } from './dto/give-admin.dto';
import { RoleEnum } from '../../common/enums/role.enum';
import { UserDto } from '../../common/dtos/user-public.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: IUsersRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  getAllExistingUsers(): Promise<UserDto[]> {
    return this.userRepository.getAllExistingUsers();
  }

  findUserById(userId: string): Promise<UserDto | null> {
    return this.userRepository.findUserById(userId);
  }

  async createUser(createUserData: createUserDto): Promise<UsersEntity | null> {
    return this.userRepository.createOneUser(createUserData);
  }

  async updateUser(userId: string, updateData: updateUserDto): Promise<string> {
    const user = await this.userRepository.findUserByIdWithDeleted(userId);
    if (!user || user.deletedAt)
      throw new BadRequestException('user not found');
    return this.userRepository.updateUser(userId, updateData);
  }

  async deleteUser(userId: string): Promise<string> {
    const user = await this.userRepository.findUserByIdWithDeleted(userId);
    if (!user || user.deletedAt)
      throw new BadRequestException('user not found');
    const userDeleted = await this.userRepository.deleteOneUserById(userId);
    const refreshTokenDeleted =
      await this.refreshTokenRepository.deleteRefreshTokenByUserId(userId);
    return `${userDeleted}, ${refreshTokenDeleted}`;
  }

  async recoverUser(recoverUserData: recoverUserDto): Promise<string> {
    //add number verification
    const user = await this.userRepository.findUserByPhoneWithDeleted(
      recoverUserData.phone,
    );
    if (!user || user.deletedAt)
      throw new BadRequestException('user not found');

    return this.userRepository.recoverUser(recoverUserData);
  }

  async recreateUser(recreateUserData: recreateUserDto): Promise<UserDto> {
    const { login, phone, password, age, bio } = recreateUserData;
    //add number verification
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(recreateUserData.password, salt);

    recreateUserData = { login, phone, password: hashedPassword, age, bio };
    return this.userRepository.recreateUser(recreateUserData);
  }

  //admin method
  getAll(): Promise<UserDto[]> {
    return this.userRepository.getAllUsers();
  }

  //admin method
  async deleteUserHard(userId: string): Promise<string> {
    const user = await this.userRepository.findUserByIdWithDeleted(userId);
    if (!user) throw new BadRequestException('user not found');
    if (user.deletedAt) Logger.warn('user was already softly deleted');
    const userDeleted = await this.userRepository.deleteOneUserByIdHard(userId);
    const refreshTokenDeleted =
      await this.refreshTokenRepository.deleteRefreshTokenByUserId(userId);
    return `${userDeleted}, ${refreshTokenDeleted}`;
  }

  //admin method
  async giveAdmin(giveAdminData: giveAdminDto): Promise<string> {
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
