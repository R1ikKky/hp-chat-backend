import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleEnum } from './enums/role.enum';

export interface JwtPayload {
  userId: string;
  userRole: RoleEnum;
  userLogin: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  verifyJwt(authHeader: string): string {
    const token = this.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new Error('invalid token');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return payload.userLogin;
    } catch (e) {
      throw new Error(`invalid token${String(e)}`);
    }
  }

  verifyJwtPayload(authHeader: string): JwtPayload {
    const token = this.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new Error('invalid token');
    }

    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch (e) {
      throw new Error(`invalid token${String(e)}`);
    }
  }

  private extractTokenFromHeader(authHeader: string): string | undefined {
    return authHeader.split(' ')[1];
  }
}
