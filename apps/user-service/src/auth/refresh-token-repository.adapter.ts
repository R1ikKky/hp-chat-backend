import { DeleteResult, EntityManager } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

export abstract class IRefreshTokenRepository {
  abstract saveRefreshToken(
    refreshToken: string,
    userId: string,
    userAgent: string,
    ip: string,
    expiresIn: Date,
  ): Promise<RefreshTokenEntity>;
  abstract findRefreshToken(
    refreshToken: string,
    entityManager?: EntityManager,
  ): Promise<RefreshTokenEntity | null>;
  abstract deleteRefreshTokenByUserId(userId: string): Promise<DeleteResult>;
  abstract deleteRefreshToken(
    refreshToken: string,
    entityManager?: EntityManager,
  ): Promise<DeleteResult>;
}
