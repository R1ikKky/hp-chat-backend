import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import type { IUploadedMulterFile } from '../../providers/files/s3/interfaces/upload-file.interface';
import { IFileService } from '../../providers/files/files.adapter';
import { IAvatarRepository } from './avatar-repository.adapter';
import { AvatarEntity } from './entities/avatar.entity';

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
    const storageResponse = await this.fileService.uploadFile({
      file,
      folder,
      name: userId,
    });
    if (!storageResponse) {
      throw new BadRequestException('i dont know bro');
    }
    return await this.avatarRepository.saveAvatar(userId, storageResponse.path);
  }
}
