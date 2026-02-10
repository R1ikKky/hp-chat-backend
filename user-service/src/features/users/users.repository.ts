import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { BaseRepository } from '../../common/repositories/base.repository';
import { DataSource, EntityManager, Repository, UpdateResult } from 'typeorm';
import { UsersEntity } from './entities/user.entity';
import { IUsersRepository } from './dto/users-repository.interface';
import { createUserDto } from './dto/create-user.dto';
import { updateUserDto } from './dto/update-user.dto';
import { recoverUserDto } from './dto/recover-user.dto';
import { recreateUserDto } from './dto/recreate-user.dto';
import { RoleEnum } from '../../common/enums/role.enum';
import { giveAdminDto } from './dto/give-admin.dto';

@Injectable()
export class UsersRepository
  extends BaseRepository
  implements IUsersRepository
{
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  private usersRepository(
    entityManager?: EntityManager,
  ): Repository<UsersEntity> {
    return this.getRepository(UsersEntity, entityManager);
  }

  async getAllExistingUsers(): Promise<UsersEntity[]> {
    return this.usersRepository().find();
  }

  async findUserById(userId: string): Promise<UsersEntity | null> {
    return this.usersRepository().findOne({
      where: { id: userId },
    });
  }

  async findUserByIdWithDeleted(userId: string): Promise<UsersEntity | null> {
    return this.usersRepository().findOne({
      withDeleted: true,
      where: { id: userId },
    });
  }

  async findUserByPhone(phone: string): Promise<UsersEntity | null> {
    return this.usersRepository().findOne({
      where: { phone },
    });
  }

  async findUserByPhoneWithDeleted(phone: string): Promise<UsersEntity | null> {
    return this.usersRepository().findOne({
      withDeleted: true,
      where: { phone },
    });
  }

  async findUserByLogin(login: string): Promise<UsersEntity | null> {
    return this.usersRepository().findOne({
      where: { login },
    });
  }

  async findUserByLoginWithDeleted(login: string): Promise<UsersEntity | null> {
    return this.usersRepository().findOne({
      withDeleted: true,
      where: { login },
    });
  }

  async createOneUser(createUserData: createUserDto): Promise<UsersEntity> {
    return this.usersRepository().save(createUserData);
  }

  async updateUser(
    userId: string,
    updateUserData: updateUserDto,
  ): Promise<string> {
    const updateRelust = await this.usersRepository().update(
      userId,
      updateUserData,
    );
    if (updateRelust.affected) {
      return `update completed, updated colums: ${updateRelust.affected}`;
    }
    throw new BadRequestException('nothing to update');
  }

  async deleteOneUserById(userId: string): Promise<string> {
    try {
      const result = await this.usersRepository().softDelete({ id: userId });
      if (result.affected) return 'user affected';
      return 'user not affected';
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async deleteOneUserHardByPhone(phone: string): Promise<string> {
    try {
      const result = await this.usersRepository().delete({ phone });
      if (result.affected) return 'user affected';
      return 'user not affected';
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async recreateUser(recreateUserData: recreateUserDto): Promise<UsersEntity> {
    const phone = recreateUserData.phone;
    const user = await this.usersRepository().findOne({
      withDeleted: true,
      where: { phone },
    });
    if (!user) {
      throw new BadRequestException('user not found');
    }
    if (!user.deletedAt) {
      throw new BadRequestException('user already exists');
    }
    const deletedUser = await this.usersRepository().delete({ phone });
    if (deletedUser.affected === 1) {
      const newUser = this.usersRepository().save(recreateUserData);
      return newUser;
    } else {
      throw new NotImplementedException("couldnt delete user");
    }
  }

  async recoverUser(recoverUserData: recoverUserDto): Promise<string> {
    const phone = recoverUserData.phone;
    const user = await this.usersRepository().findOne({
      withDeleted: true,
      where: { phone },
    });
    if (!user) {
      throw new BadRequestException('no user found');
    }
    if (!user.deletedAt) {
      throw new BadRequestException('user already exists');
    }
    this.usersRepository().restore({ phone });
    return `user ${user.login} recovered`;
  }

  async getAllUsers(): Promise<UsersEntity[]> {
    return this.usersRepository().find({ withDeleted: true });
  }

  async deleteOneUserByIdHard(userId: string): Promise<string> {
    try {
      const result = await this.usersRepository().delete({ id: userId });
      if (result.affected) return 'user affected';
      return 'user not affected';
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async giveAdmin(giveAdminData: giveAdminDto): Promise<string> {
    const updateRelust = await this.usersRepository().update({ id: giveAdminData.newAdminId }, { role: RoleEnum.ADMIN });
    if (updateRelust.affected) {
      return `update completed, updated colums: ${updateRelust.affected}`;
    }
    throw new BadRequestException();
  }
}
