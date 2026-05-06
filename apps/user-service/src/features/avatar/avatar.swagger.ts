import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import { DeleteAvatarDto } from './dto/delete-avatar.dto';
import { AvatarEntity } from './entities/avatar.entity';

export const ApiAvatarTag = ApiTags('Avatar');

export const ApiUploadAvatar = () =>
  applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: UploadAvatarDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: AvatarEntity,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'you have reached maximum avatars count',
    }),
  );

export const ApiDeleteAvatar = () =>
  applyDecorators(
    ApiBody({ type: DeleteAvatarDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      type: String,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'you dont have permissions to delete this avatar',
    }),
  );
