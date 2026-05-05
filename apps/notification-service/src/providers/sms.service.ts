import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmscResponse } from '../dto/smsc-response';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly baseUrl = `https://smsc.ru/sys/send.php`;

  constructor(private readonly cfg: ConfigService) {}

  async sendSms(phone: string, message: string): Promise<void> {
    const params = new URLSearchParams({
      login: this.cfg.getOrThrow<string>('SMSC_LOGIN'),
      psw: this.cfg.getOrThrow<string>('SMSC_PASSWORD'),
      phones: phone,
      mes: message,
      fmt: '3',
      charset: 'utf-8',
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params.toString()}`);
      const data = (await response.json()) as SmscResponse;

      if (data.error_code) {
        throw new Error(`SMSC error [${data.error_code}]: ${data.error}`);
      }
      this.logger.log(`SMS sent to ${phone}, message id: ${data.id}`);
    } catch (e) {
      this.logger.error(`Failed to send SMS to ${phone}`, e);
      throw e;
    }
  }
}
