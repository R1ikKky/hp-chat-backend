import { Controller, Post } from '@nestjs/common';
import { NotificationGateway } from './notification/notification.gateway';
import { UserId } from '@app/auth';

@Controller('notification')
export class NotificationServiceController {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  @Post('send')
  sendNotification(@UserId() userId: string): string {
    return this.notificationGateway.sendNotification(userId);
  }
}
