import { Controller } from '@nestjs/common';
import { NotificationGateway } from './notification/notification.gateway';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { TransferCompletedPayload } from './dto/transfer-completed-payload.interface';

@Controller('notification')
export class NotificationServiceController {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  // @Post('send')
  // sendNotification(@UserId() userId: string): string {
  //   return this.notificationGateway.sendNotification(userId);
  // }

  @EventPattern('transfer-completed')
  sendTransferNotification(@Payload() data: TransferCompletedPayload) {
    this.notificationGateway.sendNotification(data);
  }
}
