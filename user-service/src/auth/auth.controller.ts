import { Body, Controller, HttpStatus, Ip, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RefreshTokenDto } from './dto/refresh-tokens.dto';
import { Public } from '../common/decorators/public.decorator';
import { LogoutDto } from './dto/logout.dto';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignupResponseDto } from './dto/signup-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { TokensDto } from './dto/tokens.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiParam({
    name: 'signupData',
    required: true,
    type: SignupDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: SignupResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Public()
  @Post('signup')
  async signup(
    @Body() signupData: SignupDto,
    @Req() req: Request,
    @Ip() ip: string,
  ): Promise<SignupResponseDto> {
    return this.authService.signup(signupData, req, ip);
  }

  @ApiParam({
    name: 'loginData',
    required: true,
    type: LoginDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'wrong credentials',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'this user was deleted',
  })
  @Public()
  @Post('login')
  async login(
    @Body() loginData: LoginDto,
    @Req() req: Request,
    @Ip() ip: string,
  ): Promise<LoginResponseDto> {
    return this.authService.login(loginData, req, ip);
  }

  @ApiParam({
    name: 'refreshTokenDto',
    required: true,
    type: RefreshTokenDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: TokensDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'invalid refresh token',
  })
  @Public()
  @Post('refresh')
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
    @Ip() ip: string,
  ): Promise<TokensDto> {
    return this.authService.refreshTokens(
      refreshTokenDto.refreshToken,
      req,
      ip,
    );
  }

  @ApiParam({
    name: 'logoutData',
    required: true,
    type: LogoutDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: TokensDto,
  })
  @Post('logout')
  async logout(@Body() logoutData: LogoutDto): Promise<string> {
    return this.authService.logout(logoutData);
  }
}
