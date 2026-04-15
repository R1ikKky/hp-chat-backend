import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories/base.repository';
import {
  DataSource,
  DeleteResult,
  EntityManager,
  Repository,
  UpdateResult,
} from 'typeorm';
import { UsersEntity } from './entities/user.entity';
import { IUsersRepository } from './users-repository.adapter';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RecoverUserDto } from './dto/recover-user.dto';
import { RecreateUserDto } from './dto/recreate-user.dto';
import { RoleEnum } from '@app/auth';
import { AvatarEntity } from '../avatar/entities/avatar.entity';

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
    return this.usersRepository().find({ relations: { avatars: true } });
  }

  async findUserById(userId: string): Promise<UsersEntity | null> {
    return this.usersRepository().findOne({
      where: { id: userId },
      relations: { avatars: true },
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

  async findUserByPhoneOrLoginWithDeleted(
    phone: string,
    login: string,
  ): Promise<UsersEntity | null> {
    return this.usersRepository().findOne({
      withDeleted: true,
      where: [{ phone }, { login }],
    });
  }

  async createOneUser(createUserData: CreateUserDto): Promise<UsersEntity> {
    return this.usersRepository().save(createUserData);
  }

  async updateUser(
    userId: string,
    updateUserData: UpdateUserDto,
  ): Promise<UpdateResult> {
    return this.usersRepository().update(userId, updateUserData);
  }

  async deleteOneUserById(userId: string): Promise<DeleteResult> {
    return this.usersRepository().softDelete({ id: userId });
  }

  async deleteOneUserHardByPhone(phone: string): Promise<DeleteResult> {
    return this.usersRepository().delete({ phone });
  }

  async recreateUser(recreateUserData: RecreateUserDto): Promise<UsersEntity> {
    return this.usersRepository().save(recreateUserData);
  }

  async recoverUser({ phone }: RecoverUserDto): Promise<UpdateResult> {
    return this.usersRepository().restore({ phone });
  }

  async getActiveUsers(
    min_age: number,
    max_age: number,
  ): Promise<UsersEntity[]> {
    return this.usersRepository()
      .createQueryBuilder('u')
      .where('u.age > :min_age AND u.age < :max_age', { min_age, max_age })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('COUNT(a.id)')
          .from(AvatarEntity, 'a')
          .where('a.userId = u.id')
          .getQuery();
        return `(${subQuery}) > 2`;
      })
      .getMany();
  }

  async getAllUsers(): Promise<UsersEntity[]> {
    return this.usersRepository().find({ withDeleted: true });
  }

  async deleteOneUserByIdHard(userId: string): Promise<DeleteResult> {
    return this.usersRepository().delete({ id: userId });
  }

  async giveAdmin(newAdminId: string): Promise<UpdateResult> {
    return this.usersRepository().update(
      { id: newAdminId },
      { role: RoleEnum.ADMIN },
    );
  }

  async increaseBalance(
    userId: string,
    amount: number,
    entityManager: EntityManager,
  ): Promise<UpdateResult> {
    return this.usersRepository(entityManager)
      .createQueryBuilder()
      .update(UsersEntity)
      .set({ balance: () => 'balance + :amount' })
      .setParameters({ amount })
      .where('id = :userId', { userId })
      .execute();
  }

  async decreaseBalance(
    userId: string,
    amount: number,
    entityManager: EntityManager,
  ): Promise<UpdateResult> {
    return this.usersRepository(entityManager)
      .createQueryBuilder()
      .update(UsersEntity)
      .set({ balance: () => 'balance - :amount' })
      .setParameters({ amount })
      .where('id = :userId', { userId })
      .andWhere('balance >= :amount', { amount })
      .execute();
  }

  async resetBalance(): Promise<UpdateResult> {
    return this.usersRepository().updateAll({ balance: 0 });
  }
}
