import { DataSource, EntityManager, Repository, UpdateResult } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { IAvatarRepository } from './avatar-repository.adapter';
import { AvatarEntity } from './entities/avatar.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AvatarRepository
  extends BaseRepository
  implements IAvatarRepository
{
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  private avatarRepository(
    entityManager?: EntityManager,
  ): Repository<AvatarEntity> {
    return this.getRepository(AvatarEntity, entityManager);
  }

  async getAllAvatarsByUserId(userId: string): Promise<AvatarEntity[]> {
    return await this.avatarRepository().find({ where: { userId } });
  }

  async saveAvatar(userId: string, avatarLink: string): Promise<AvatarEntity> {
    return await this.avatarRepository().save({
      userId,
      avatarLink,
      isActive: false,
    });
  }

  async deleteAvatar(avatarId: string): Promise<UpdateResult> {
    return await this.avatarRepository().softDelete(avatarId);
  }

  async getAvatarById(avatarId: string): Promise<AvatarEntity | null> {
    return await this.avatarRepository().findOne({
      where: { id: avatarId },
    });
  }

  async findGroupByIds(userIds: string[]): Promise<AvatarEntity[]> {
    return await this.avatarRepository()
      .createQueryBuilder('a')
      .where('a.userId IN (:...userIds)', { userIds })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('MAX(sub.createdAt)')
          .from(AvatarEntity, 'sub')
          .where('sub.userId = a.userId')
          .getQuery();
        return `a.createdAt = ${subQuery}`;
      })
      .getMany();
  }
}
