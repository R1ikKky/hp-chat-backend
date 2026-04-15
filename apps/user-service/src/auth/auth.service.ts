import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { SignupDto, SignupResponseDto } from './dto/signup.dto';
import { IUsersRepository } from '../features/users/users-repository.adapter';
import * as bcrypt from 'bcrypt';
import { IRefreshTokenRepository } from './refresh-token-repository.adapter';
import { LogoutDto } from './dto/logout.dto';
import { RoleEnum } from '@app/auth';
import { DataSource } from 'typeorm';
import { TokensDto } from './dto/tokens.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name, { timestamp: true });

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: IUsersRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly dataSource: DataSource,
  ) {}

  async signup(
    signupData: SignupDto,
    userAgent: string,
    ip: string,
  ): Promise<SignupResponseDto> {
    try {
      const { login, phone, password, age, bio } = signupData;

      const phoneOrLoginInUse =
        await this.usersRepository.findUserByPhoneOrLoginWithDeleted(
          phone,
          login,
        );

      if (phoneOrLoginInUse && phoneOrLoginInUse.deletedAt) {
        throw new BadRequestException(
          'user with the same login or phone has been deleted',
        );
      }
      if (phoneOrLoginInUse) {
        throw new BadRequestException('phone or login already in use');
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await this.usersRepository.createOneUser({
        login,
        phone,
        password: hashedPassword,
        age,
        bio,
      });
      const tokens = await this.generateUserTokens(
        user.id,
        user.role,
        userAgent,
        ip,
      );
      return {
        user,
        tokens,
      };
    } catch (error) {
      this.logger.error(`an error occured when trying to sign up`, error);
      throw error;
    }
  }

  async login(
    { phone, password }: LoginDto,
    userAgent: string,
    ip: string,
  ): Promise<LoginResponseDto> {
    try {
      const user = await this.usersRepository.findUserByPhoneWithDeleted(phone);
      if (!user) {
        throw new UnauthorizedException('wrong credentials');
      }

      const passwordIsCorrect: boolean = await bcrypt.compare(
        password,
        user.password,
      );
      if (!passwordIsCorrect) {
        throw new UnauthorizedException('wrong credentials');
      }

      if (user.deletedAt) {
        throw new NotFoundException('this user was deleted');
      }

      const tokens = await this.generateUserTokens(
        user.id,
        user.role,
        userAgent,
        ip,
      );
      return {
        ...tokens,
        userId: user.id,
      };
    } catch (error) {
      this.logger.error(`an error occured when trying to log in`, error);
      throw error;
    }
  }

  async logout({ refreshToken }: LogoutDto): Promise<string> {
    try {
      const deletedToken =
        await this.refreshTokenRepository.deleteRefreshToken(refreshToken);
      if (!deletedToken.affected) {
        throw new UnauthorizedException('refresh token didnt deleted');
      }
      return 'refresh token deleted';
    } catch (error) {
      this.logger.error(`an error occured when trying to log out`, error);
      throw error;
    }
  }

  async refreshTokens(
    refreshToken: string,
    userAgent: string,
    ip: string,
  ): Promise<TokensDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const token = await this.refreshTokenRepository.findRefreshToken(
        refreshToken,
        queryRunner.manager,
      );

      if (!token) {
        throw new UnauthorizedException('invalid refresh token');
      }

      const deletedToken = await this.refreshTokenRepository.deleteRefreshToken(
        refreshToken,
        queryRunner.manager,
      );

      if (!deletedToken.affected) {
        throw new UnauthorizedException('refresh token didnt deleted');
      }

      await queryRunner.commitTransaction();

      return this.generateUserTokens(
        token.userId,
        token.user.role,
        userAgent,
        ip,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `an error occured when trying to refresh tokens`,
        error,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async generateUserTokens(
    userId: string,
    userRole: RoleEnum,
    userAgent: string,
    ip: string,
  ): Promise<TokensDto> {
    const accessToken = this.jwtService.sign(
      { userId, userRole },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign({ userId }, { expiresIn: '90d' });

    await this.saveRefreshToken(refreshToken, userId, userAgent, ip);

    return {
      accessToken,
      refreshToken,
    };
  }

  async saveRefreshToken(
    refreshToken: string,
    userId: string,
    userAgent: string,
    ip: string,
  ): Promise<void> {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + 90);

    await this.refreshTokenRepository.saveRefreshToken(
      refreshToken,
      userId,
      userAgent,
      ip,
      expiresIn,
    );
  }
}
