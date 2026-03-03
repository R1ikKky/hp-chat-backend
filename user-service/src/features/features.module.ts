import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AvatarModule } from './avatar/avatar.module';
import { BalanceResetModule } from './balance-reset/balance-reset.module';

@Module({
  controllers: [],
  providers: [],
  imports: [UsersModule, AvatarModule, BalanceResetModule],
})
export class FeaturesModule {}
