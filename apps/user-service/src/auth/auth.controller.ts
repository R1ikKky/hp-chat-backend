import { Body, Controller, Headers, Ip, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { SignupDto, SignupResponseDto } from './dto/signup.dto';
import { RefreshTokenDto } from './dto/refresh-tokens.dto';
import { Public } from '@app/auth';
import { LogoutDto } from './dto/logout.dto';
import { TokensDto } from './dto/tokens.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Throttle } from '@nestjs/throttler';
import {
  ApiAuthTag,
  ApiLogin,
  ApiLogout,
  ApiRefreshTokens,
  ApiSendOtp,
  ApiSignup,
  ApiVerifyOtp,
} from './auth.swagger';

@ApiAuthTag
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiSignup()
  @Public()
  @Throttle({ auth: { ttl: 3_600_000, limit: 15 } })
  @Post('signup')
  async signup(
    @Body() signupData: SignupDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ): Promise<SignupResponseDto> {
    return this.authService.signup(signupData, userAgent, ip);
  }

  @ApiLogin()
  @Public()
  @Throttle({ auth: { ttl: 60_000, limit: 6 } })
  @Post('login')
  async login(
    @Body() loginData: LoginDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ): Promise<LoginResponseDto> {
    return this.authService.login(loginData, userAgent, ip);
  }

  @ApiRefreshTokens()
  @Public()
  @Post('refresh')
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ): Promise<TokensDto> {
    return this.authService.refreshTokens(
      refreshTokenDto.refreshToken,
      userAgent,
      ip,
    );
  }

  @ApiLogout()
  @Post('logout')
  async logout(@Body() logoutData: LogoutDto): Promise<string> {
    return this.authService.logout(logoutData);
  }

  @ApiSendOtp()
  @Public()
  @Throttle({ auth: { ttl: 60_000, limit: 2 } })
  @Post('send-otp')
  async sendOtp(@Body() { phone }: SendOtpDto): Promise<string> {
    return this.authService.sendOtp(phone);
  }

  @ApiVerifyOtp()
  @Public()
  @Throttle({ auth: { ttl: 300_000, limit: 5 } })
  @Post('verify-otp')
  async verifyOtp(@Body() { phone, code }: VerifyOtpDto): Promise<boolean> {
    return this.authService.verifyOtp(phone, code);
  }
}
