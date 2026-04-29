import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersRepositoryProvider } from './users-repository.provider';
import { ProvidersModule } from '../../providers/providers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './entities/user.entity';
import { RefreshTokenEntity } from '../../auth/entities/refresh-token.entity';
import { AuthGuard } from '@app/auth';
import { refreshTokenRepositoryProvider } from '../../auth/refresh-token-repository.provider';
import { AvatarEntity } from '../avatar/entities/avatar.entity';
import { avatarRepositoryProvider } from '../avatar/avatar-repository.provider';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ProvidersModule,
    TypeOrmModule.forFeature([UsersEntity, RefreshTokenEntity, AvatarEntity]),
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
            groupId: 'user-service-client',
          },
        },
      },
    ]),
  ],
  providers: [
    UsersService,
    usersRepositoryProvider,
    refreshTokenRepositoryProvider,
    avatarRepositoryProvider,
    AuthGuard,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
