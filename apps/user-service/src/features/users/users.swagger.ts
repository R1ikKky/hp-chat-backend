import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { RecoverUserDto } from './dto/recover-user.dto';
import { RecreateUserDto } from './dto/recreate-user.dto';
import { GiveAdminDto } from './dto/give-admin.dto';
import { GetActiveUsersDto } from './dto/get-active-users.dto';
import { IncreaseBalanceDto } from './dto/increase-balance.dto';
import { DecreaseBalanceDto } from './dto/decrease-balance.dto';
import { TransferMoneyDto } from './dto/transfer-money.dto';
import { UserDto } from '../../common/dtos/user-public.dto';

export const ApiUsersTag = ApiTags('Users');

export const ApiGetAllExisting = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: UserDto,
      isArray: true,
    }),
  );

export const ApiGetMe = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: UserDto,
    }),
  );

export const ApiUpdateMe = () =>
  applyDecorators(
    ApiBody({ type: UpdateUserDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: String,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'nothing to update',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'user not found',
    }),
  );

export const ApiDeleteMe = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: String,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'user not found',
    }),
  );

export const ApiRecoverMe = () =>
  applyDecorators(
    ApiBody({ type: RecoverUserDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: String,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'user not found',
    }),
  );

export const ApiRecreateMe = () =>
  applyDecorators(
    ApiBody({ type: RecreateUserDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: UserDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'user not found',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'user already exists',
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'couldnt delete user',
    }),
  );

export const ApiGetAll = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: UserDto,
      isArray: true,
    }),
  );

export const ApiDeleteOneHard = () =>
  applyDecorators(
    ApiBody({ schema: { type: 'string', format: 'uuid' } }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: String,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'user not found',
    }),
  );

export const ApiGiveAdmin = () =>
  applyDecorators(
    ApiBody({ type: GiveAdminDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: String,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'user not found',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'user <recieved userId> is already admin',
    }),
  );

export const ApiGetActiveUsers = () =>
  applyDecorators(
    ApiBody({ type: GetActiveUsersDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: UserDto,
      isArray: true,
    }),
  );

export const ApiIncreaseBalance = () =>
  applyDecorators(
    ApiBody({ type: IncreaseBalanceDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'balance updated',
      type: String,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'user not found',
    }),
  );

export const ApiDecreaseBalance = () =>
  applyDecorators(
    ApiBody({ type: DecreaseBalanceDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'balance updated',
      type: String,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'user not found or dont have enougth money',
    }),
  );

export const ApiTransferMoney = () =>
  applyDecorators(
    ApiBody({ type: TransferMoneyDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'transfer from <senderId> to <receiverId> executed',
      type: String,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'transfer failed: user not found',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'transfer failed: user not found or dont have enougth money',
    }),
  );
