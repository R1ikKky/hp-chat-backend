import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { IRefreshTokenRepository } from './refresh-token-repository.adapter';
import {
  DataSource,
  DeleteResult,
  EntityManager,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

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
  ): Repository<RefreshTokenEntity> {
    return this.getRepository(RefreshTokenEntity, entityManager);
  }

  saveRefreshToken(
    refreshToken: string,
    userId: string,
    userAgent: string,
    ip: string,
    expiresIn: Date,
  ): Promise<RefreshTokenEntity> {
    return this.refreshTokenRepository().save({
      refreshToken,
      userId,
      ua: userAgent,
      ip,
      expiresIn,
    });
  }

  findRefreshToken(
    refreshToken: string,
    entityManager?: EntityManager,
  ): Promise<RefreshTokenEntity | null> {
    return this.refreshTokenRepository(entityManager).findOne({
      where: { refreshToken, expiresIn: MoreThanOrEqual(new Date()) },
      relations: { user: true },
    });
  }

  async deleteRefreshTokenByUserId(userId: string): Promise<DeleteResult> {
    return this.refreshTokenRepository().delete({ userId });
  }

  async deleteRefreshToken(
    refreshToken: string,
    entityManager?: EntityManager,
  ): Promise<DeleteResult> {
    return this.refreshTokenRepository(entityManager).delete({ refreshToken });
  }
}
