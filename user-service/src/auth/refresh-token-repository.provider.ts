import { Provider } from '@nestjs/common';
import { IRefreshTokenRepository } from './refresh-token-repository.adapter';
import { RefreshTokenRepository } from './refresh-token.repository';

export const refreshTokenRepositoryProvider: Provider = {
  provide: IRefreshTokenRepository,
  useClass: RefreshTokenRepository,
};
