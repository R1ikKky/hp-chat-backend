import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AvatarModule } from './avatar/avatar.module';

@Module({
  controllers: [],
  providers: [],
  imports: [UsersModule, AvatarModule],
})
export class FeaturesModule {}
