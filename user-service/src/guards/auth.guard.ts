import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { CustomRequest } from '../common/interfaces/customRequest.interface';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

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
    if(isPublic){
      return true
    }


    const request: CustomRequest = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('invalid token');

    try {
      const payload = this.jwtService.verify(token);
      request.userId = payload.userId;
      request.userRole = payload.userRole;
    } catch (e) {
      throw new UnauthorizedException(`invalid token${e}`);
    }

    return true;
  }

  private extractTokenFromHeader(req: CustomRequest): string | undefined {
    return req.headers.authorization?.split(' ')[1];
  }
}
