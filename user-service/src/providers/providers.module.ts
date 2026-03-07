import { Module } from '@nestjs/common';
import { PostgresModule } from './databases/postgresql/postgresql.module';
import { FilesModule } from './files/files.module';
import { RedisModule } from './databases/redis/redis.module';

@Module({
  imports: [PostgresModule, FilesModule, RedisModule],
  exports: [PostgresModule, FilesModule, RedisModule],
})
export class ProvidersModule {}
