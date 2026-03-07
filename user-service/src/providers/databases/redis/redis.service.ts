import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisType } from 'ioredis';

@Injectable()
export class RedisService {
  private client: RedisType;
  constructor(private readonly cfg: ConfigService) {
    this.client = new Redis({
      host: cfg.get('REDIS_HOST'),
      port: cfg.get('REDIS_PORT'),
      password: String(cfg.get('REDIS_PASSWORD')),
    });
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number) {
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, data, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, data);
    }
  }

  async del(key: string) {
    await this.client.del(key);
  }
}
