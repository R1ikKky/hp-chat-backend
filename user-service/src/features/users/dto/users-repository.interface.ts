import { UpdateResult } from "typeorm";
import { UsersEntity } from "../entities/user.entity";
import { createUserDto } from "./create-user.dto";
import { updateUserDto } from "./update-user.dto";
import { recoverUserDto } from "./recover-user.dto";
import { recreateUserDto } from "./recreate-user.dto";

export abstract class IUsersRepository {
    abstract getAllUsers(): Promise<UsersEntity[]>;
    abstract findUserById(userId: string): Promise<UsersEntity | null>;
    abstract findUserByIdWithDeleted(userId: string): Promise<UsersEntity | null>;
    abstract findUserByPhone(phone: string): Promise<UsersEntity | null>;
    abstract findUserByPhoneWithDeleted(phone: string): Promise<UsersEntity | null>
    abstract findUserByLogin(login: string): Promise<UsersEntity | null>;
    abstract findUserByLoginWithDeleted(login: string): Promise<UsersEntity | null>;
    abstract createOneUser(createUserData: createUserDto): Promise<UsersEntity>
    abstract updateUser(userId: string, updateUserData: updateUserDto): Promise<string>
    abstract deleteOneUserById(userId: string): Promise<string>
    abstract recreateUser(recreateUserData: recreateUserDto): Promise<UsersEntity>
    abstract recoverUser(recoverUserData: recoverUserDto): Promise<string>
} 