import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { AuthService } from './auth.service';
import { IUsersRepository } from '../features/users/users-repository.adapter';
import { IRefreshTokenRepository } from './refresh-token-repository.adapter';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    const jwtService = {
      sign: jest.fn(),
    } as unknown as JwtService;
    const usersRepository = {} as IUsersRepository;
    const refreshTokenRepository = {} as IRefreshTokenRepository;
    const dataSource = {} as DataSource;

    service = new AuthService(
      jwtService,
      usersRepository,
      refreshTokenRepository,
      dataSource,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
