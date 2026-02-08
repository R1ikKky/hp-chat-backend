import { Module } from '@nestjs/common';
import { PostgresModule } from './databases/postgresql/postgresql.module';

@Module({
    imports: [PostgresModule],
    exports: [PostgresModule]
})
export class ProvidersModule {}
