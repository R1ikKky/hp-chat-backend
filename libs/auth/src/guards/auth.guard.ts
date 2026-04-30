import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RoleEnum } from '../enums/role.enum';
import { CustomRequest } from '../interfaces/custom-request.interface';

interface JwtPayload {
  userId: string;
  userRole: RoleEnum;
  userLogin: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request: CustomRequest = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('invalid token');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      request.userId = payload.userId;
      request.userRole = payload.userRole;
      request.userLogin = payload.userLogin;
    } catch (e) {
      throw new UnauthorizedException(`invalid token${String(e)}`);
    }

    return true;
  }

  private extractTokenFromHeader(req: CustomRequest): string | undefined {
    return req.headers.authorization?.split(' ')[1];
  }
}
