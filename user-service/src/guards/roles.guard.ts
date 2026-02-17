import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  MethodNotAllowedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomRequest } from '../common/interfaces/customRequest.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skipGuard = this.reflector.get<boolean>(
      'skipAuthGuard',
      context.getHandler(),
    );
    if (skipGuard) {
      return true;
    }
    const roles: string[] = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }
    const request: CustomRequest = context.switchToHttp().getRequest();
    const userRole: string = request.userRole;
    if (!userRole) throw new BadRequestException('cant find the role');

    if (roles.some((role) => userRole == role)) {
      return true;
    } else {
      throw new MethodNotAllowedException('this method only for admins');
    }
  }
}
