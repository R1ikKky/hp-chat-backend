import { Controller, Logger } from '@nestjs/common';
import { NotificationGateway } from './notification/notification.gateway';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { TransferCompletedPayload } from './dto/transfer-completed-payload.interface';
import { SmsService } from './providers/sms.service';
import type { SmsSentPayload } from './dto/sms-sent-payload.interface';

@Controller('notification')
export class NotificationServiceController {
  private readonly logger = new Logger(NotificationServiceController.name);

  constructor(
    private readonly notificationGateway: NotificationGateway,
    private readonly smsService: SmsService,
  ) {}

  @EventPattern('transfer-completed')
  sendTransferNotification(@Payload() data: TransferCompletedPayload) {
    this.logger.log(`Kafka event 'transfer-completed' received`);
    this.notificationGateway.sendNotification(data);
  }

  @EventPattern('send-sms-otp')
  async sendOtpSms(@Payload() data: SmsSentPayload) {
    this.logger.log(`Kafka event 'send-sms-otp' received`);
    await this.smsService.sendSms(data.phone, data.message);
  }
}
