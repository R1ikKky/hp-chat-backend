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
    try {
      const UserAvatars =
        await this.avatarRepository.getAllAvatarsByUserId(userId);

      if (UserAvatars.length >= 5) {
        throw new BadRequestException('you have reached maximum avatars count');
      }

      const { path } = await this.fileService.uploadFile({
        file,
        folder,
        name: userId,
      });
      return await this.avatarRepository.saveAvatar(userId, path);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async deleteAvatar(
    { avatarId }: DeleteAvatarDto,
    userId: string,
  ): Promise<string> {
    try {
      const avatar = await this.avatarRepository.getAvatarById(avatarId);
      if (!avatar) {
        throw new BadRequestException('avatar not found');
      }

      const { userId: userIdFromAvatarMetadata } = avatar;

      if (!(userId === userIdFromAvatarMetadata)) {
        throw new BadRequestException(
          'you dont have permissions to delete this avatar',
        );
      }

      const deletedAvatar = await this.avatarRepository.deleteAvatar(avatarId);
      if (!deletedAvatar.affected) {
        throw new BadRequestException('user didnt deleted');
      }
      return 'user deleted';
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
