import { Body, Controller, Ip, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { UsersEntity } from '../features/users/entities/user.entity';
import { RefreshTokenDto } from './dto/refresh-tokens.dto';
import { Public } from '../common/decorators/public.decorator';
import { logoutDto } from './dto/logout.dto';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiParam({
    name: 'signupData',
    required: true,
    type: SignupDto,
  })
  @Public()
  @Post('signup')
  async signup(
    @Body() signupData: SignupDto,
    @Req() req: Request,
    @Ip() ip: string,
  ): Promise<{
    user: UsersEntity;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  }> {
    return this.authService.signup(signupData, req, ip);
  }

  @ApiParam({
    name: 'loginData',
    required: true,
    type: LoginDto,
  })
  @Public()
  @Post('login')
  async login(
    @Body() loginData: LoginDto,
    @Req() req: Request,
    @Ip() ip: string,
  ) {
    return this.authService.login(loginData, req, ip);
  }

  @ApiParam({
    name: 'refreshTokenDto',
    required: true,
    type: RefreshTokenDto,
  })
  @Public()
  @Post('refresh')
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
    @Ip() ip: string,
  ) {
    return this.authService.refreshTokens(
      refreshTokenDto.refreshToken,
      req,
      ip,
    );
  }

  @ApiParam({
    name: 'logoutData',
    required: true,
    type: logoutDto,
  })
  @Post('logout')
  async logout(@Body() logoutData: logoutDto) {
    this.authService.logout(logoutData);
  }
}
