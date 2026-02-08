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
import { UsersEntity } from '../features/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { IRefreshTokenRepository } from './dto/refresh-token-repository.interface';
import { logoutDto } from './dto/logout.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: IUsersRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async signup(
    signupData: SignupDto,
    req: Request,
    ip: string,
  ): Promise<{
    user: UsersEntity;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  }> {
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
    const tokens = await this.generateUserTokens(user.id, userAgent, ip);
    return {
      user,
      tokens,
    };
  }

  async login(
    loginDto: LoginDto,
    req: Request,
    ip: string,
  ): Promise<{
    userId: string;
    accessToken: string;
    refreshToken: string;
  }> {
    const { phone, password } = loginDto;
    const userAgent = req.headers['user-agent'];

    const user = await this.userRepository.findUserByPhoneWithDeleted(phone);
    if (!user) throw new UnauthorizedException('wrong credentials');

    const passwordIsCorrect: boolean = await bcrypt.compare(
      password,
      user.password,
    );
    if (!passwordIsCorrect) {
      throw new UnauthorizedException('password doesnt match');
    }

    if (user.deletedAt) throw new NotFoundException('this user was deleted');

    const tokens = await this.generateUserTokens(user.id, userAgent, ip);
    return {
      ...tokens,
      userId: user.id,
    };
  }

  async logout(logoutData: logoutDto): Promise<string> {
    return this.refreshTokenRepository.deleteRefreshToken(
      logoutData.refreshToken,
    );
  }

  async refreshTokens(
    refreshToken: string,
    req: Request,
    ip: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const userAgent = req.headers['user-agent'];

    const token =
      await this.refreshTokenRepository.returnRefreshTokenAndDeleteItAfter(
        refreshToken,
      );
    if (!token) throw new UnauthorizedException('invalid refresh token');

    return this.generateUserTokens(token.userId, userAgent, ip);
  }

  async generateUserTokens(
    userId: string,
    userAgent: string,
    ip: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = this.jwtService.sign({ userId });
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
