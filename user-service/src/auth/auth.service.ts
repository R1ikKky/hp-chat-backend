import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { IUsersRepository } from '../features/users/dto/users-repository.interface';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { IRefreshTokenRepository } from './dto/refresh-token-repository.interface';
import { LogoutDto } from './dto/logout.dto';
import { RoleEnum } from '../common/enums/role.enum';
import { DataSource } from 'typeorm';
import { SignupResponseDto } from './dto/signup-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { TokensDto } from './dto/tokens.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: IUsersRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly dataSource: DataSource,
  ) {}

  async signup(
    signupData: SignupDto,
    req: Request,
    ip: string,
  ): Promise<SignupResponseDto> {
    const { login, phone, password, age, bio } = signupData;

    const userAgent = req.headers['user-agent'];

    const phoneInUse =
      await this.userRepository.findUserByPhoneWithDeleted(phone);
    const loginInUse =
      await this.userRepository.findUserByLoginWithDeleted(login);

    if (phoneInUse && phoneInUse.deletedAt)
      throw new BadRequestException(
        'user with the same phone number has been deleted',
      );
    if (phoneInUse) throw new BadRequestException('phone already in use');
    if (loginInUse && loginInUse.deletedAt)
      throw new BadRequestException(
        'user with the same login has been deleted',
      );
    if (loginInUse) throw new BadRequestException('login already in use');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userRepository.createOneUser({
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
  }

  async login(
    loginDto: LoginDto,
    req: Request,
    ip: string,
  ): Promise<LoginResponseDto> {
    const { phone, password } = loginDto;
    const userAgent = req.headers['user-agent'];

    const user = await this.userRepository.findUserByPhoneWithDeleted(phone);
    if (!user) throw new UnauthorizedException('wrong credentials');

    const passwordIsCorrect: boolean = await bcrypt.compare(
      password,
      user.password,
    );
    if (!passwordIsCorrect) {
      throw new UnauthorizedException('wrong credentials');
    }

    if (user.deletedAt) throw new NotFoundException('this user was deleted');

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
  }

  async logout(logoutData: LogoutDto): Promise<string> {
    return this.refreshTokenRepository.deleteRefreshToken(
      logoutData.refreshToken,
    );
  }

  async refreshTokens(
    refreshToken: string,
    req: Request,
    ip: string,
  ): Promise<TokensDto> {
    const userAgent = req.headers['user-agent'];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const token =
        await this.refreshTokenRepository.findRefreshToken(refreshToken);
      if (!token) throw new UnauthorizedException('invalid refresh token');
      await this.refreshTokenRepository.deleteRefreshToken(refreshToken);
      await queryRunner.commitTransaction();
      return this.generateUserTokens(
        token.userId,
        token.user.role,
        userAgent,
        ip,
      );
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new UnauthorizedException(`someting went wrong ${e}`);
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
    const accessToken = this.jwtService.sign({ userId, userRole });
    const refreshToken = uuidv4();

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
