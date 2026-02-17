import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../features/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { usersRepositoryProvider } from '../features/users/dto/users-repository.provider';
import { ProvidersModule } from '../providers/providers.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { refreshTokenRepositoryProvider } from './dto/refresh-token-repository.provider';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    usersRepositoryProvider,
    refreshTokenRepositoryProvider,
  ],
  imports: [
    UsersModule,
    ProvidersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (cfg: ConfigService) => ({
        secret: await cfg.get('JWT_SECRET'),
      }),
      global: true,
      inject: [ConfigService],
    }),
  ],
})
export class AuthModule {}
