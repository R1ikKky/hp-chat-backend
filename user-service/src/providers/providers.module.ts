import { Module } from '@nestjs/common';
import { PostgresModule } from './databases/postgresql/postgresql.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [PostgresModule, FilesModule],
  exports: [PostgresModule, FilesModule],
})
export class ProvidersModule {}
