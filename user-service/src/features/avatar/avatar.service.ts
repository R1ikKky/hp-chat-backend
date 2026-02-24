import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import type { IUploadedMulterFile } from '../../providers/files/s3/interfaces/upload-file.interface';
import { IFileService } from '../../providers/files/files.adapter';
import { IAvatarRepository } from './avatar-repository.adapter';
import { AvatarEntity } from './entities/avatar.entity';
import { DeleteAvatarDto } from './dto/delete-avatar.dto';

@Injectable()
export class AvatarService {
  constructor(
    private readonly fileService: IFileService,
    private readonly avatarRepository: IAvatarRepository,
  ) {}

  async uploadAvatar(
    { folder }: UploadAvatarDto,
    file: IUploadedMulterFile,
    userId: string,
  ): Promise<AvatarEntity> {
    const UserAvatars =
      await this.avatarRepository.getAllAvatarsByUserId(userId);
    if (UserAvatars.length < 5) {
      const { path } = await this.fileService.uploadFile({
        file,
        folder,
        name: userId,
      });
      return await this.avatarRepository.saveAvatar(userId, path);
    }
    throw new BadRequestException('you have reached maximum avatars count');
  }

  async deleteAvatar(
    { avatarId }: DeleteAvatarDto,
    userId: string,
  ): Promise<string> {
    const { userId: userIdFromAvatarMetadata } =
      await this.avatarRepository.getAvatarById(avatarId);
    if (!(userId === userIdFromAvatarMetadata)) {
      throw new BadRequestException(
        'you dont have permissions to delete this avatar',
      );
    }
    return await this.avatarRepository.deleteAvatar(avatarId);
  }
}
