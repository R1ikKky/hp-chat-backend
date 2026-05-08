import { IsUUID } from 'class-validator';

export class DeleteAvatarDto {
  @IsUUID()
  readonly avatarId!: string;
}
