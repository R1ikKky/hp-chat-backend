import { RoleEnum } from '../../common/enums/role.enum';

export class UserDto {
  id!: string;
  login!: string;
  phone!: string;
  role!: RoleEnum;
}
