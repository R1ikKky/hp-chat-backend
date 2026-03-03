import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

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
      await this.resetBalanceQueue.add('resetBalance', {
        priority: 1,
        delay: 2000,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
      });
      this.logger.log(`Bulljs job 'resetBalance' was thrown to the queue`);
      return 'done';
    } catch (e) {
      throw new BadRequestException(`something went wrong ${String(e)}`);
    }
  }
}
