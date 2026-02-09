import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { IRefreshTokenRepository } from './dto/refresh-token-repository.interface';
import {
  DataSource,
  EntityManager,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { refreshTokenEntity } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository
  extends BaseRepository
  implements IRefreshTokenRepository
{
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  private refreshTokenRepository(
    entityManager?: EntityManager,
  ): Repository<refreshTokenEntity> {
    return this.getRepository(refreshTokenEntity, entityManager);
  }

  saveRefreshToken(
    refreshToken: string,
    userId: string,
    userAgent: string,
    ip: string,
    expiresIn: Date,
  ): Promise<refreshTokenEntity> {
    return this.refreshTokenRepository().save({
      refreshToken,
      userId,
      ua: userAgent,
      ip,
      expiresIn,
    });
  }

  findRefreshToken(refreshToken: string): Promise<refreshTokenEntity | null> {
    return this.refreshTokenRepository().findOne({
      where: { refreshToken, expiresIn: MoreThanOrEqual(new Date()) },
      relations: { user: true }
    });
  }

  async returnRefreshTokenAndDeleteItAfter(
    refreshToken: string
  ): Promise<refreshTokenEntity | null> {
    const deletedToken = await this.refreshTokenRepository()
      .createQueryBuilder()
      .delete()
      .from(refreshTokenEntity)
      .where('refreshToken = :refreshToken', { refreshToken })
      .andWhere('expiresIn >= now()')
      .returning('*')
      .execute();
    return deletedToken.raw[0];
  }

  async deleteRefreshTokenByUserId(userId: string): Promise<string> {
    this.refreshTokenRepository().delete( { userId } )
    return "refresh token deleted"
  }

  async deleteRefreshToken(refreshToken: string): Promise<string> {
    this.refreshTokenRepository().delete( { refreshToken } )
    return "refresh token deleted"
  }

}
