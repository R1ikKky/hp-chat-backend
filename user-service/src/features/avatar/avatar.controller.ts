import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserId } from '../../common/decorators/user-id.decorator';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import type { IUploadedMulterFile } from '../../providers/files/s3/interfaces/upload-file.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarEntity } from './entities/avatar.entity';
import { DeleteAvatarDto } from './dto/delete-avatar.dto';
import { imageFileFilter } from '../../common/utils/imageFileFilter';

@ApiTags('Avatar')
@Controller('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @ApiParam({
    name: 'uploadAvatarData',
    required: true,
    type: 'UploadAvatarDto',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'you have reached maximum avatars count',
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: {
        fileSize: 1000 * 1000 * 10,
      },
      fileFilter: imageFileFilter,
    }),
  )
  @Post('upload-avatar')
  async uploadAvatar(
    @Body() uploadAvatarData: UploadAvatarDto,
    @UploadedFile() file: IUploadedMulterFile,
    @UserId() userId: string,
  ): Promise<AvatarEntity> {
    return this.avatarService.uploadAvatar(uploadAvatarData, file, userId);
  }

  @ApiParam({
    name: 'deleteAvatarData',
    required: true,
    type: 'DeleteAvatarDto',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'you dont have permissions to delete this avatar',
  })
  @Delete('delete-avatar')
  async deleteAvatar(
    @Body() deleteAvatarData: DeleteAvatarDto,
    @UserId() userId: string,
  ): Promise<string> {
    return await this.avatarService.deleteAvatar(deleteAvatarData, userId);
  }
}
