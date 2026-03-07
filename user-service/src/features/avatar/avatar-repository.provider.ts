import { Provider } from '@nestjs/common';
import { IAvatarRepository } from './avatar-repository.adapter';
import { AvatarRepository } from './avatar.repository';

export const avatarRepositoryProvider: Provider = {
  provide: IAvatarRepository,
  useClass: AvatarRepository,
};
