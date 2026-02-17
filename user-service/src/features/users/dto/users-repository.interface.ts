import { UsersEntity } from '../entities/user.entity';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { RecoverUserDto } from './recover-user.dto';
import { RecreateUserDto } from './recreate-user.dto';
import { GiveAdminDto } from './give-admin.dto';

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
  ): Promise<string>;
  abstract deleteOneUserById(userId: string): Promise<string>;
  abstract recreateUser(
    recreateUserData: RecreateUserDto,
  ): Promise<UsersEntity>;
  abstract recoverUser(recoverUserData: RecoverUserDto): Promise<string>;
  abstract getAllUsers(): Promise<UsersEntity[]>;
  abstract deleteOneUserByIdHard(userId: string): Promise<string>;
  abstract giveAdmin(giveAdminData: GiveAdminDto): Promise<string>;
}
