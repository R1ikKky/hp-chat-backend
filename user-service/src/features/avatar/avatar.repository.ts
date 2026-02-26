import { DataSource, EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { IAvatarRepository } from './avatar-repository.adapter';
import { AvatarEntity } from './entities/avatar.entity';
import { UploadException } from '../../providers/files/s3/exceptions/upload.exception';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class avatarRepository
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
    try {
      console.log(avatarLink);
      return await this.avatarRepository().save({
        userId,
        avatarLink,
        isActive: false,
      });
    } catch (e) {
      throw new UploadException(`error occured: ${String(e)}`);
    }
  }

  async deleteAvatar(avatarId: string): Promise<string> {
    const deletedAvatar = await this.avatarRepository().softDelete(avatarId);
    if (!deletedAvatar.affected) return 'user not affected';
    return 'user affected';
  }

  async getAvatarById(avatarId: string): Promise<AvatarEntity> {
    const avatar = await this.avatarRepository().findOne({
      where: { id: avatarId },
    });
    if (!avatar) throw new BadRequestException('avatar not found');
    return avatar;
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
