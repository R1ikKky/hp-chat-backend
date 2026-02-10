import 'reflect-metadata'
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'rick',
  password: 'rick',
  database: 'user-service',

  synchronize: false,
  migrations: ['databases/migrations/*{.ts,.js}'],
  entities: ['src/**/*.entity{.ts,.js}'],

  migrationsRun: false,
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'all',
});
