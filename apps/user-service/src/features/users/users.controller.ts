import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, RoleEnum, UserLogin } from '@app/auth';
import { RecoverUserDto } from './dto/recover-user.dto';
import { RecreateUserDto } from './dto/recreate-user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { GiveAdminDto } from './dto/give-admin.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDto } from '../../common/dtos/user-public.dto';
import { UserId } from '../../common/decorators/user-id.decorator';
import { GetActiveUsersDto } from './dto/get-active-users.dto';
import { IncreaseBalanceDto } from './dto/increase-balance.dto';
import { DecreaseBalanceDto } from './dto/decrease-balance.dto';
import { TransferMoneyDto } from './dto/transfer-money.dto';

@ApiTags('Users')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: UserDto,
    isArray: true,
  })
  @Get('get-all-existing')
  async getAllExisting(): Promise<UserDto[]> {
    return this.usersService.getAllExistingUsers();
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: UserDto })
  @Get('me')
  async getOne(@UserId() userId: string): Promise<UserDto | null> {
    return this.usersService.findUserById(userId);
  }

  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'nothing to update',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user not found',
  })
  @Patch('update-me')
  async updateOne(
    @UserId() userId: string,
    @Body() updateData: UpdateUserDto,
  ): Promise<string> {
    return this.usersService.updateUser(userId, updateData);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user not found',
  })
  @Delete('delete-me')
  async deleteMe(@UserId() userId: string): Promise<string> {
    return this.usersService.deleteUser(userId);
  }

  @ApiBody({ type: RecoverUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user not found',
  })
  @Public()
  @Post('recover-me')
  async recoverUser(@Body() recoverUserData: RecoverUserDto): Promise<string> {
    return this.usersService.recoverUser(recoverUserData);
  }

  @ApiBody({ type: RecreateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user already exists',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'couldnt delete user',
  })
  @Public()
  @Post('recreate-me')
  async recreateUser(
    @Body() recreateUserData: RecreateUserDto,
  ): Promise<UserDto> {
    return this.usersService.recreateUser(recreateUserData);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: UserDto,
    isArray: true,
  })
  @Get('get-all')
  @Roles(RoleEnum.ADMIN)
  async getAll(): Promise<UserDto[]> {
    return this.usersService.getAll();
  }

  @ApiBody({
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user not found',
  })
  @Delete('delete-one-hard')
  @Roles(RoleEnum.ADMIN)
  async deleteOneHard(@Body() userId: string): Promise<string> {
    return this.usersService.deleteUserHard(userId);
  }

  @ApiBody({ type: GiveAdminDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user <recieved userId> is already admin',
  })
  @Post('give-admin')
  @Roles(RoleEnum.ADMIN)
  async giveAdmin(@Body() giveAdminData: GiveAdminDto): Promise<string> {
    return this.usersService.giveAdmin(giveAdminData);
  }

  @ApiBody({ type: GetActiveUsersDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: UserDto,
    isArray: true,
  })
  @Post('get-active-users')
  async getActiveUsers(
    @Body() getActiveUsersData: GetActiveUsersDto,
  ): Promise<UserDto[]> {
    return this.usersService.getActiveUsers(getActiveUsersData);
  }

  @ApiBody({ type: IncreaseBalanceDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'balance updated',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user not found',
  })
  @Post('increase-my-balance')
  @Roles(RoleEnum.ADMIN)
  async increaseBalance(
    @Body() increaseBalanceData: IncreaseBalanceDto,
    @UserId() userId: string,
  ): Promise<string> {
    return this.usersService.increaseBalance(increaseBalanceData, userId);
  }

  @ApiBody({ type: DecreaseBalanceDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'balance updated',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user not found or dont have enougth money',
  })
  @Post('decrease-my-balance')
  @Roles(RoleEnum.ADMIN)
  async decreaseBalance(
    @Body() decreaseBalanceData: DecreaseBalanceDto,
    @UserId() userId: string,
  ): Promise<string> {
    return this.usersService.decreaseBalance(decreaseBalanceData, userId);
  }

  @ApiBody({ type: TransferMoneyDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'transfer from <senderId> to <receiverId> executed',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'transfer failed: user not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'transfer failed: user not found or dont have enougth money',
  })
  @Post('transfer-money')
  @Roles(RoleEnum.ADMIN)
  async transferMoney(
    @Body() transferMoneyData: TransferMoneyDto,
    @UserId() senderId: string,
    @UserLogin() senderLogin: string,
  ): Promise<string> {
    return this.usersService.transferMoney(
      transferMoneyData,
      senderId,
      senderLogin,
    );
  }
}
