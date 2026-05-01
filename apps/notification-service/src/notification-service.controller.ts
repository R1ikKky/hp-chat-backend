import { Controller, Logger } from '@nestjs/common';
import { NotificationGateway } from './notification/notification.gateway';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { TransferCompletedPayload } from './dto/transfer-completed-payload.interface';

@Controller('notification')
export class NotificationServiceController {
  private readonly logger = new Logger(NotificationServiceController.name);

  constructor(private readonly notificationGateway: NotificationGateway) {}

  @EventPattern('transfer-completed')
  sendTransferNotification(@Payload() data: TransferCompletedPayload) {
    this.logger.log(`Kafka event 'transfer-completed' received`);
    this.notificationGateway.sendNotification(data);
  }
}
