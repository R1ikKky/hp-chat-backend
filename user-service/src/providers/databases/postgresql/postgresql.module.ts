import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (cfg: ConfigService) => {
                return {
                    type: "postgres",
                    username: cfg.get("DB_USERNAME"),
                    password: cfg.get("DB_PASSWORD"),
                    host: cfg.get("DB_HOST"),
                    port: Number(cfg.get("DB_PORT")),
                    database: cfg.get("DB_NAME"),

                    autoLoadEntities: true,
                    synchronize: true
                }
            },
            inject: [ConfigService]
        })
    ],
    exports: []
})
export class PostgresModule {}
