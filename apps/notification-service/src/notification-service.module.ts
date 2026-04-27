import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard, AuthModule } from '@app/auth';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationGateway } from './notification/notification.gateway';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule],
  controllers: [NotificationServiceController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    NotificationGateway,
  ],
})
export class NotificationServiceModule {}
