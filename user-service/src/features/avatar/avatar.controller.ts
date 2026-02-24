import {
  Body,
  Controller,
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
    description: '',
  })
  @UseInterceptors(FileInterceptor('avatar'))
  @Post('upload-avatar')
  async uploadAvatar(
    @Body() uploadAvatarData: UploadAvatarDto,
    @UploadedFile() file: IUploadedMulterFile,
    @UserId() userId: string,
  ): Promise<AvatarEntity> {
    return this.avatarService.uploadAvatar(uploadAvatarData, file, userId);
  }
}
