import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
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
import { UserDto } from '../../common/dtos/user-public.dto';
import { UserId } from '../../common/decorators/user-id.decorator';
import { GetActiveUsersDto } from './dto/get-active-users.dto';
import { IncreaseBalanceDto } from './dto/increase-balance.dto';
import { DecreaseBalanceDto } from './dto/decrease-balance.dto';
import { TransferMoneyDto } from './dto/transfer-money.dto';
import {
  ApiUsersTag,
  ApiGetAllExisting,
  ApiGetMe,
  ApiUpdateMe,
  ApiDeleteMe,
  ApiRecoverMe,
  ApiRecreateMe,
  ApiGetAll,
  ApiDeleteOneHard,
  ApiGiveAdmin,
  ApiGetActiveUsers,
  ApiIncreaseBalance,
  ApiDecreaseBalance,
  ApiTransferMoney,
} from './users.swagger';

@ApiUsersTag
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiGetAllExisting()
  @Get('get-all-existing')
  async getAllExisting(): Promise<UserDto[]> {
    return this.usersService.getAllExistingUsers();
  }

  @ApiGetMe()
  @Get('me')
  async getOne(@UserId() userId: string): Promise<UserDto | null> {
    return this.usersService.findUserById(userId);
  }

  @ApiUpdateMe()
  @Patch('update-me')
  async updateOne(
    @UserId() userId: string,
    @Body() updateData: UpdateUserDto,
  ): Promise<string> {
    return this.usersService.updateUser(userId, updateData);
  }

  @ApiDeleteMe()
  @Delete('delete-me')
  async deleteMe(@UserId() userId: string): Promise<string> {
    return this.usersService.deleteUser(userId);
  }

  @ApiRecoverMe()
  @Public()
  @Post('recover-me')
  async recoverUser(@Body() recoverUserData: RecoverUserDto): Promise<string> {
    return this.usersService.recoverUser(recoverUserData);
  }

  @ApiRecreateMe()
  @Public()
  @Post('recreate-me')
  async recreateUser(
    @Body() recreateUserData: RecreateUserDto,
  ): Promise<UserDto> {
    return this.usersService.recreateUser(recreateUserData);
  }

  @ApiGetAll()
  @Get('get-all')
  @Roles(RoleEnum.ADMIN)
  async getAll(): Promise<UserDto[]> {
    return this.usersService.getAll();
  }

  @ApiDeleteOneHard()
  @Delete('delete-one-hard')
  @Roles(RoleEnum.ADMIN)
  async deleteOneHard(@Body() userId: string): Promise<string> {
    return this.usersService.deleteUserHard(userId);
  }

  @ApiGiveAdmin()
  @Post('give-admin')
  @Roles(RoleEnum.ADMIN)
  async giveAdmin(@Body() giveAdminData: GiveAdminDto): Promise<string> {
    return this.usersService.giveAdmin(giveAdminData);
  }

  @ApiGetActiveUsers()
  @Post('get-active-users')
  async getActiveUsers(
    @Body() getActiveUsersData: GetActiveUsersDto,
  ): Promise<UserDto[]> {
    return this.usersService.getActiveUsers(getActiveUsersData);
  }

  @ApiIncreaseBalance()
  @Post('increase-my-balance')
  @Roles(RoleEnum.ADMIN)
  async increaseBalance(
    @Body() increaseBalanceData: IncreaseBalanceDto,
    @UserId() userId: string,
  ): Promise<string> {
    return this.usersService.increaseBalance(increaseBalanceData, userId);
  }

  @ApiDecreaseBalance()
  @Post('decrease-my-balance')
  @Roles(RoleEnum.ADMIN)
  async decreaseBalance(
    @Body() decreaseBalanceData: DecreaseBalanceDto,
    @UserId() userId: string,
  ): Promise<string> {
    return this.usersService.decreaseBalance(decreaseBalanceData, userId);
  }

  @ApiTransferMoney()
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
