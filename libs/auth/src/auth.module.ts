import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({ secret: cfg.get('JWT_SECRET') }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthGuard, RolesGuard, AuthService],
  exports: [AuthGuard, RolesGuard, AuthService, JwtModule],
})
export class AuthModule {}
