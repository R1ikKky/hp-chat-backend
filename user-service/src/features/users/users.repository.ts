import {
  BadRequestException,
  Injectable,
  NotImplementedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BaseRepository } from '../../common/repositories/base.repository';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { UsersEntity } from './entities/user.entity';
import { IUsersRepository } from './users-repository.adapter';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RecoverUserDto } from './dto/recover-user.dto';
import { RecreateUserDto } from './dto/recreate-user.dto';
import { RoleEnum } from '../../common/enums/role.enum';
import { GiveAdminDto } from './dto/give-admin.dto';
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
    try {
      return this.usersRepository().find({ relations: { avatars: true } });
    } catch (e) {
      throw new UnprocessableEntityException(`good luck: ${String(e)}`);
    }
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

  async recreateUser(recreateUserData: RecreateUserDto): Promise<UsersEntity> {
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
      throw new NotImplementedException('couldnt delete user');
    }
  }

  async recoverUser({ phone }: RecoverUserDto): Promise<string> {
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
    await this.usersRepository().restore({ phone });
    return `user ${user.login} recovered`;
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

  async deleteOneUserByIdHard(userId: string): Promise<string> {
    try {
      const result = await this.usersRepository().delete({ id: userId });
      if (result.affected) return 'user affected';
      return 'user not affected';
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async giveAdmin({ newAdminId }: GiveAdminDto): Promise<string> {
    const updateRelust = await this.usersRepository().update(
      { id: newAdminId },
      { role: RoleEnum.ADMIN },
    );
    if (updateRelust.affected) {
      return `update completed, updated colums: ${updateRelust.affected}`;
    }
    throw new BadRequestException();
  }

  async increaseBalance(userId: string, amount: number): Promise<string> {
    const updated = await this.usersRepository()
      .createQueryBuilder()
      .update(UsersEntity)
      .set({ balance: () => 'balance + :amount' })
      .setParameters({ amount })
      .where('id = :userId', { userId })
      .execute();
    if (!updated.affected) {
      throw new BadRequestException('user not found');
    }
    return 'balance updated';
  }

  async decreaseBalance(userId: string, amount: number): Promise<string> {
    const updated = await this.usersRepository()
      .createQueryBuilder()
      .update(UsersEntity)
      .set({ balance: () => 'balance - :amount' })
      .setParameters({ amount })
      .where('id = :userId', { userId })
      .andWhere('balance >= :amount', { amount })
      .execute();
    if (!updated.affected) {
      throw new BadRequestException(
        'user not found or dont have enougth money',
      );
    }
    return 'balance updated';
  }
}
