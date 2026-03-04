import { UsersEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RecoverUserDto } from './dto/recover-user.dto';
import { RecreateUserDto } from './dto/recreate-user.dto';
import { DeleteResult, EntityManager, UpdateResult } from 'typeorm';

export abstract class IUsersRepository {
  abstract getAllExistingUsers(): Promise<UsersEntity[]>;
  abstract findUserById(userId: string): Promise<UsersEntity | null>;
  abstract findUserByIdWithDeleted(userId: string): Promise<UsersEntity | null>;
  abstract findUserByPhone(phone: string): Promise<UsersEntity | null>;
  abstract findUserByPhoneWithDeleted(
    phone: string,
  ): Promise<UsersEntity | null>;
  abstract findUserByLogin(login: string): Promise<UsersEntity | null>;
  abstract findUserByLoginWithDeleted(
    login: string,
  ): Promise<UsersEntity | null>;
  abstract findUserByPhoneOrLoginWithDeleted(
    phone: string,
    login: string,
  ): Promise<UsersEntity | null>;
  abstract createOneUser(createUserData: CreateUserDto): Promise<UsersEntity>;
  abstract updateUser(
    userId: string,
    updateUserData: UpdateUserDto,
  ): Promise<UpdateResult>;
  abstract deleteOneUserById(userId: string): Promise<DeleteResult>;
  abstract deleteOneUserHardByPhone(phone: string): Promise<DeleteResult>;
  abstract recreateUser(
    recreateUserData: RecreateUserDto,
  ): Promise<UsersEntity>;
  abstract recoverUser(recoverUserData: RecoverUserDto): Promise<UpdateResult>;
  abstract getActiveUsers(
    min_age: number,
    max_age: number,
  ): Promise<UsersEntity[]>;
  abstract getAllUsers(): Promise<UsersEntity[]>;
  abstract deleteOneUserByIdHard(userId: string): Promise<DeleteResult>;
  abstract giveAdmin(newAdminId: string): Promise<UpdateResult>;
  abstract increaseBalance(
    userId: string,
    amount: number,
    entityManager?: EntityManager,
  ): Promise<UpdateResult>;
  abstract decreaseBalance(
    userId: string,
    amount: number,
    entityManager?: EntityManager,
  ): Promise<UpdateResult>;
  abstract resetBalance(): Promise<UpdateResult>;
}
