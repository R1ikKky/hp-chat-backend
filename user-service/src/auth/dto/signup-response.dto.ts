import { UsersEntity } from '../../features/users/entities/user.entity';

export class signupResponseDto {
  user!: UsersEntity;
  tokens!: {
    accessToken: string;
    refreshToken: string;
  };
}
