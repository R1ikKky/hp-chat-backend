import { Request } from 'express';
import { RoleEnum } from '../enums/role.enum';

export interface CustomRequest extends Request {
  userId: string;
  userRole: RoleEnum;
}
