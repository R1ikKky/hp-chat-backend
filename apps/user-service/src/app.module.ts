import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FeaturesModule } from './features/features.module';
import { ConfigsModule } from './configs/configs.module';
import { ProvidersModule } from './providers/providers.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    AuthModule,
    FeaturesModule,
    ConfigsModule,
    ProvidersModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthModule, FeaturesModule, ConfigsModule, ProvidersModule],
})
export class AppModule {}
