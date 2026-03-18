import {
  Body,
  Controller,
  Headers,
  HttpStatus,
  Ip,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { SignupDto, SignupResponseDto } from './dto/signup.dto';
import { RefreshTokenDto } from './dto/refresh-tokens.dto';
import { Public } from '../common/decorators/public.decorator';
import { LogoutDto } from './dto/logout.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TokensDto } from './dto/tokens.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: SignupResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user with the same login or phone has been deleted',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'phone or login already in use',
  })
  @Public()
  @Post('signup')
  async signup(
    @Body() signupData: SignupDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ): Promise<SignupResponseDto> {
    return this.authService.signup(signupData, userAgent, ip);
  }

  @ApiBody({ type: LoginDto })
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
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ): Promise<LoginResponseDto> {
    return this.authService.login(loginData, userAgent, ip);
  }

  @ApiBody({ type: RefreshTokenDto })
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
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ): Promise<TokensDto> {
    return this.authService.refreshTokens(
      refreshTokenDto.refreshToken,
      userAgent,
      ip,
    );
  }

  @ApiBody({ type: LogoutDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: 'string',
  })
  @Post('logout')
  async logout(@Body() logoutData: LogoutDto): Promise<string> {
    return this.authService.logout(logoutData);
  }
}
