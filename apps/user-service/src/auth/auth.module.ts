import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../features/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { usersRepositoryProvider } from '../features/users/users-repository.provider';
import { ProvidersModule } from '../providers/providers.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { refreshTokenRepositoryProvider } from './refresh-token-repository.provider';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'notification',
            brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
          },
          consumer: {
            groupId: 'auth-service-client',
          },
        },
      },
    ]),
  ],
})
export class AuthModule {}
