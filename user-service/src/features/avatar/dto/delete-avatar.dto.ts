import { IsUUID } from 'class-validator';

export class DeleteAvatarDto {
  @IsUUID() avatarId!: string;
}
