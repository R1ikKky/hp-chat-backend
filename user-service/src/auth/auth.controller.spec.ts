import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto, SignupResponseDto } from './dto/signup.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleEnum } from '../common/enums/role.enum';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<Pick<AuthService, 'signup' | 'login'>>;

  beforeEach(async () => {
    const authServiceMock: jest.Mocked<Pick<AuthService, 'signup' | 'login'>> =
      {
        signup: jest.fn(),
        login: jest.fn(),
      };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    authController = module.get(AuthController);
  });

  describe('signup', () => {
    it('should return user entity and tokens', async () => {
      const signupData: SignupDto = {
        login: 'rick',
        phone: '+79999999999',
        password: 'secret123',
        age: 20,
        bio: 'test bio',
      };
      const result: SignupResponseDto = {
        user: {
          id: 'user-id-1',
          login: 'rick',
          phone: '+79999999999',
          role: RoleEnum.REGULARUSER,
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      };

      authService.signup.mockResolvedValue(result);

      await expect(
        authController.signup(signupData, 'jest-agent', '127.0.0.1'),
      ).resolves.toEqual(result);

      expect(authService.signup).toHaveBeenCalledWith(
        signupData,
        'jest-agent',
        '127.0.0.1',
      );
    });
  });

  describe('login', () => {
    it('should return user id and tokens', async () => {
      const loginData: LoginDto = {
        phone: '+79000000000',
        password: 'admin123',
      };
      const result: LoginResponseDto = {
        userId: 'user-id-1',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      authService.login.mockResolvedValue(result);

      await expect(
        authController.login(loginData, 'jest-agent', '127.0.0.1'),
      ).resolves.toEqual(result);

      expect(authService.login).toHaveBeenCalledWith(
        loginData,
        'jest-agent',
        '127.0.0.1',
      );
    });
  });
});
