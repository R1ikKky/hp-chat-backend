import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { SignupDto, SignupResponseDto } from './dto/signup.dto';
import { RefreshTokenDto } from './dto/refresh-tokens.dto';
import { TokensDto } from './dto/tokens.dto';
import { LogoutDto } from './dto/logout.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

export const ApiAuthTag = ApiTags('Auth');

export const ApiSignup = () =>
  applyDecorators(
    ApiBody({ type: SignupDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: SignupResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'user with the same login or phone has been deleted',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'phone or login already in use',
    }),
  );

export const ApiLogin = () =>
  applyDecorators(
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: LoginResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'wrong credentials',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'this user was deleted',
    }),
  );

export const ApiRefreshTokens = () =>
  applyDecorators(
    ApiBody({ type: RefreshTokenDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: TokensDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'invalid refresh token',
    }),
  );

export const ApiLogout = () =>
  applyDecorators(
    ApiBody({ type: LogoutDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: String,
    }),
  );

export const ApiSendOtp = () =>
  applyDecorators(
    ApiBody({ type: SendOtpDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'otp sent',
      type: String,
    }),
  );

export const ApiVerifyOtp = () =>
  applyDecorators(
    ApiBody({ type: VerifyOtpDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'true/false',
      type: Boolean,
    }),
  );
