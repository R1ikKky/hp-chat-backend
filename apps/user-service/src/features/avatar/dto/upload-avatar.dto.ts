import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AvatarEntity } from '../entities/avatar.entity';

export class UploadAvatarDto {
  @ApiProperty({ example: '/users/avatars' })
  @IsString()
  readonly folder!: '/users/avatars';
}

export class UploadAvatarResultDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly avatarEntity!: AvatarEntity;
}
