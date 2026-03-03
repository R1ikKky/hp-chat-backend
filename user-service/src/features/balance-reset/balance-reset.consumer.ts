import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { IUsersRepository } from '../users/users-repository.adapter';
import { BadRequestException, Logger } from '@nestjs/common';

@Processor('reset-balance', { concurrency: 5 })
export class resetBalanceConsumer extends WorkerHost {
  private readonly logger = new Logger(resetBalanceConsumer.name, {
    timestamp: true,
  });

  constructor(private readonly userRepository: IUsersRepository) {
    super();
  }

  async process(job: Job) {
    try {
      await this.userRepository.resetBalance();
      this.logger.log(`Bulljs job '${job.id}', 'resetBalance' was executed`);
    } catch (e) {
      throw new BadRequestException(`something went wrong: ${String(e)}`);
    }
  }
}
