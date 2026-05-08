import { RoleEnum } from '@app/auth';

export class UserDto {
  id!: string;
  login!: string;
  phone!: string;
  role!: RoleEnum;
}
