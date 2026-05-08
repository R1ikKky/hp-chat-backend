import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SmscResponse } from '../dto/smsc-response';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly cfg: ConfigService,
    private readonly http: HttpService,
  ) {}

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
      const baseUrl = this.cfg.getOrThrow<string>('SMSC_BASE_URL');
      const { data } = await firstValueFrom(
        this.http.get<SmscResponse>(`${baseUrl}?${params.toString()}`),
      );

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
