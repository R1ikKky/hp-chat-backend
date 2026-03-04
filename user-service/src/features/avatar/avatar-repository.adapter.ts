import { AvatarEntity } from './entities/avatar.entity';
import { UpdateResult } from 'typeorm';

export abstract class IAvatarRepository {
  abstract saveAvatar(
    userId: string,
    avatarLink: string,
  ): Promise<AvatarEntity>;
  abstract deleteAvatar(avatarId: string): Promise<UpdateResult>;
  abstract getAllAvatarsByUserId(userId: string): Promise<AvatarEntity[]>;
  abstract getAvatarById(avatarId: string): Promise<AvatarEntity | null>;
  abstract findGroupByIds(userIds: string[]): Promise<AvatarEntity[]>;
}
