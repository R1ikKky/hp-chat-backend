import { BadRequestException, Injectable } from '@nestjs/common';
import { IUsersRepository } from './dto/users-repository.interface';
import { UsersEntity } from './entities/user.entity';
import { createUserDto } from './dto/create-user.dto';
import { IRefreshTokenRepository } from '../../auth/dto/refresh-token-repository.interface';
import { updateUserDto } from './dto/update-user.dto';
import { UpdateResult } from 'typeorm';
import { recoverUserDto } from './dto/recover-user.dto';
import { recreateUserDto } from './dto/recreate-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly userRepository: IUsersRepository,
        private readonly refreshTokenRepository: IRefreshTokenRepository
    ) {}
    
    getAllUsers(): Promise<UsersEntity[]> {
        return this.userRepository.getAllUsers()
    }

    findUserById(userId: string): Promise<UsersEntity | null> {
        return this.userRepository.findUserById(userId)
    }

    async createUser(createUserData: createUserDto): Promise<UsersEntity | null> {
        return this.userRepository.createOneUser(createUserData)
    }

    async updateUser(userId: string, updateData: updateUserDto): Promise<string> {
        return this.userRepository.updateUser(userId, updateData)
    }

    async deleteUser(userId: string): Promise<string> {
        const user = await this.userRepository.findUserByIdWithDeleted(userId)
        if(!user || user.deletedAt) throw new BadRequestException("user not found") 
        const userDeleted = await this.userRepository.deleteOneUserById(userId)
        const refreshTokenDeleted = await this.refreshTokenRepository.deleteRefreshTokenByUserId(userId)
        return `${userDeleted}, ${refreshTokenDeleted}`
    }

    async recoverUser(recoverUserData: recoverUserDto): Promise<string> {
        //add number verification
        return this.userRepository.recoverUser(recoverUserData)
    }
    
    async recreateUser(recreateUserData: recreateUserDto): Promise<UsersEntity> {
        const { login, phone, password, age, bio } = recreateUserData;
        //add number verification
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(recreateUserData.password, salt);

        recreateUserData = {login, phone, password: hashedPassword, age, bio}
        return this.userRepository.recreateUser(recreateUserData)
    }
}
