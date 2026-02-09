import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersEntity } from './entities/user.entity';
import type { createUserDto } from './dto/create-user.dto';
import { updateUserDto } from './dto/update-user.dto';
import type { CustomRequest } from '../../common/interfaces/customRequest.interface';
import { UpdateResult } from 'typeorm';
import { Public } from '../../common/decorators/public.decorator';
import { recoverUserDto } from './dto/recover-user.dto';
import { recreateUserDto } from './dto/recreate-user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';
import { giveAdminDto } from './dto/give-admin.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get('get-all-existing')
  async getAllExisting(): Promise<UsersEntity[]> {
    return this.usersService.getAllExistingUsers();
  }

  @Get('me')
  async getOne(@Req() req: CustomRequest): Promise<UsersEntity | null> {
    const userId = req.userId;
    return this.usersService.findUserById(userId);
  }

  @Patch('update-me')
  async updateOne(
    @Req() req: CustomRequest,
    @Body() updateData: updateUserDto,
  ): Promise<string> {
    const userId = req.userId;
    return this.usersService.updateUser(userId, updateData);
  }

  @Delete('delete-me')
  async deleteMe(@Req() req: CustomRequest): Promise<string> {
    const userId = req.userId;
    return this.usersService.deleteUser(userId);
  }

  @Public()
  @Post('recover-me')
  async recoverUser(@Body() recoverUserData: recoverUserDto): Promise<string> {
    return this.usersService.recoverUser(recoverUserData);
  }

  @Public()
  @Post('recreate-me')
  async recreateUser(@Body() recreateUserData: recreateUserDto): Promise<UsersEntity> {
    return this.usersService.recreateUser(recreateUserData);
  }

  @Get("get-all")
  @Roles(RoleEnum.ADMIN)
  async getAll(): Promise<UsersEntity[]> {
    return this.usersService.getAll()
  }

  @Delete('delete-one-hard')
  @Roles(RoleEnum.ADMIN)
  async deleteOneHard(@Body() userId: string): Promise<string> {
    return this.usersService.deleteUserHard(userId);
  }

  @Post("give-admin")
  @Roles(RoleEnum.ADMIN)
  async giveAdmin(@Body() giveAdminData: giveAdminDto): Promise<string> {
    return this.usersService.giveAdmin(giveAdminData)
  }
  
}
