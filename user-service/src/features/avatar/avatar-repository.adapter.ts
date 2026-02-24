import { AvatarEntity } from './entities/avatar.entity';

export abstract class IAvatarRepository {
  abstract saveAvatar(
    userId: string,
    avatarLink: string,
  ): Promise<AvatarEntity>;
  abstract deleteAvatar(avatarLink: string): Promise<string>;
  abstract getAllAvatarsByUserId(userId: string): Promise<AvatarEntity[]>;
}
