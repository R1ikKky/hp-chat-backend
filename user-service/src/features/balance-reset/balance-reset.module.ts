import { Module } from '@nestjs/common';
import { BalanceResetService } from './balance-reset.service';
import { usersRepositoryProvider } from '../users/dto/users-repository.provider';
import { BalanceResetController } from './balance-reset.controller';
import { ProvidersModule } from '../../providers/providers.module';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { resetBalanceConsumer } from './balance-reset.consumer';

@Module({
  imports: [
    ProvidersModule,
    BullModule.registerQueueAsync({
      name: 'reset-balance',
      useFactory: (cfg: ConfigService) => {
        return {
          connection: {
            host: cfg.get('REDIS_HOST'),
            port: cfg.get('REDIS_PORT'),
            password: cfg.get('REDIS_PASSWORD'),
          },
          defaultJobOptions: {
            priority: 1,
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true,
            removeOnFail: true,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [BalanceResetController],
  providers: [
    BalanceResetService,
    usersRepositoryProvider,
    resetBalanceConsumer,
  ],
  exports: [BalanceResetService, BullModule],
})
export class BalanceResetModule {}
