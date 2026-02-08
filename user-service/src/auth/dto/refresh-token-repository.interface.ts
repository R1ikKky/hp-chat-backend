import { refreshTokenEntity } from "../entities/refresh-token.entity";

export abstract class IRefreshTokenRepository {
    abstract saveRefreshToken (refreshToken: string, userId: string, userAgent: string, ip: string, expiresIn: Date): Promise<refreshTokenEntity>
    abstract findRefreshToken (refreshToken: string): Promise<refreshTokenEntity | null>
    abstract returnRefreshTokenAndDeleteItAfter (refreshToken: string): Promise<refreshTokenEntity | null>
    abstract deleteRefreshTokenByUserId (userId: string): Promise<string>
    abstract deleteRefreshToken (refreshToken: string): Promise<string>
}