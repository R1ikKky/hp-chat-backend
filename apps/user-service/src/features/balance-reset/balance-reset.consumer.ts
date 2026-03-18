import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { IUsersRepository } from '../users/users-repository.adapter';
import { BadRequestException, Logger } from '@nestjs/common';

@Processor('reset-balance', { concurrency: 5 })
export class ResetBalanceConsumer extends WorkerHost {
  private readonly logger = new Logger(ResetBalanceConsumer.name, {
    timestamp: true,
  });

  constructor(private readonly usersRepository: IUsersRepository) {
    super();
  }

  async process(job: Job) {
    try {
      const updated = await this.usersRepository.resetBalance();

      if (!updated.affected) {
        throw new BadRequestException('update failed');
      }

      this.logger.log(`Bulljs job '${job.id}', 'resetBalance' was executed`);
      return 'done';
    } catch (error) {
      this.logger.error(`Bulljs job '${job.id}', 'resetBalance' faild,`, error);
    }
  }
}
