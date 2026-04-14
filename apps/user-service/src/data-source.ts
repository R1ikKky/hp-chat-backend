import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'rick',
  password: 'rick',
  database: 'user-service',

  synchronize: false,
  migrations: ['apps/user-service/src/databases/migrations/*{.ts,.js}'],
  entities: ['apps/user-service/src/**/*.entity{.ts,.js}'],

  migrationsRun: false,
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'all',
});
