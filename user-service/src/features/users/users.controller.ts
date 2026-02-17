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
import { Public } from '../../common/decorators/public.decorator';
import { RecoverUserDto } from './dto/recover-user.dto';
import { RecreateUserDto } from './dto/recreate-user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';
import { GiveAdminDto } from './dto/give-admin.dto';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDto } from '../../common/dtos/user-public.dto';
import { UserId } from '../../common/decorators/user-id.decorator';

@ApiTags('Users')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: UserDto })
  @Get('get-all-existing')
  async getAllExisting(): Promise<UserDto[]> {
    return this.usersService.getAllExistingUsers();
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: UserDto })
  @Get('me')
  async getOne(@UserId() userId: string): Promise<UserDto | null> {
    return this.usersService.findUserById(userId);
  }

  @ApiParam({
    name: 'updateData',
    required: true,
    type: UpdateUserDto,
  })
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

  @ApiParam({
    name: 'recoverUserData',
    required: true,
    type: RecoverUserDto,
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
  @Public()
  @Post('recover-me')
  async recoverUser(@Body() recoverUserData: RecoverUserDto): Promise<string> {
    return this.usersService.recoverUser(recoverUserData);
  }

  @ApiParam({
    name: 'recreateUserData',
    required: true,
    type: RecreateUserDto,
  })
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
    status: HttpStatus.NOT_IMPLEMENTED,
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
  })
  @Get('get-all')
  @Roles(RoleEnum.ADMIN)
  async getAll(): Promise<UserDto[]> {
    return this.usersService.getAll();
  }

  @ApiParam({
    name: 'userId',
    required: true,
    type: 'uuid',
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

  @ApiParam({
    name: 'giveAdminData',
    required: true,
    type: GiveAdminDto,
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
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user <recieved userId> is already admin',
  })
  @Post('give-admin')
  @Roles(RoleEnum.ADMIN)
  async giveAdmin(@Body() giveAdminData: GiveAdminDto): Promise<string> {
    return this.usersService.giveAdmin(giveAdminData);
  }
}
