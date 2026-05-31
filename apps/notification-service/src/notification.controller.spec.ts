import { Test, TestingModule } from '@nestjs/testing';
import { NotificationServiceController } from './notification.controller';
import { NotificationGateway } from './notification/notification.gateway';
import { SmsService } from './providers/sms.service';
import { expect, beforeEach, describe, it, jest } from '@jest/globals';

const mockGateway = { sendNotification: jest.fn() };
const mockSmsService = { sendSms: jest.fn() };

describe('NotificationServiceController', () => {
  let controller: NotificationServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotificationServiceController],
      providers: [
        { provide: NotificationGateway, useValue: mockGateway },
        { provide: SmsService, useValue: mockSmsService },
      ],
    }).compile();

    controller = app.get<NotificationServiceController>(
      NotificationServiceController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});