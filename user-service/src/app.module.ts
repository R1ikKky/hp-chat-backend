import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FeaturesModule } from './features/features.module';
import { ConfigsModule } from './configs/configs.module';
import { ProvidersModule } from './providers/providers.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [AuthModule, FeaturesModule, ConfigsModule, ProvidersModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthModule, FeaturesModule, ConfigsModule, ProvidersModule],
})
export class AppModule {}
