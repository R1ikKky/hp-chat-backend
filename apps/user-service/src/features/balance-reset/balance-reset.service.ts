import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BalanceResetService {
  private readonly logger = new Logger(BalanceResetService.name, {
    timestamp: true,
  });

  constructor(
    @InjectQueue('reset-balance') private readonly resetBalanceQueue: Queue,
  ) {}

  async resetBalance() {
    try {
      await this.resetBalanceQueue.add(
        'resetBalance',
        {},
        {
          priority: 1,
          delay: 2000,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
        },
      );

      this.logger.log(`Bulljs job 'resetBalance' was thrown to the queue`);
      return 'done';
    } catch (error) {
      this.logger.error(
        `something went wrong when trying throw Bulljs job 'resetBalance' in the queue`,
        error,
      );
      throw error;
    }
  }

  @Cron('*/10 * * * *')
  async resetBalanceEveryTenMinutes() {
    await this.resetBalance();
    this.logger.log('the balance was reset by a cron task');
  }
}
