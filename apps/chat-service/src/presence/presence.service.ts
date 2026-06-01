import { Injectable } from '@nestjs/common';
import { RedisService } from '../providers/redis/redis.service';

const PRESENCE_KEY = 'chat:presence:online';
const HEARTBEAT_TIMEOUT_MS = 30_000;

@Injectable()
export class PresenceService {
  constructor(private readonly redis: RedisService) {}

  async setOnline(userId: string): Promise<void> {
    await this.redis.zadd(PRESENCE_KEY, Date.now(), userId);
  }

  async setOffline(userId: string): Promise<void> {
    await this.redis.zrem(PRESENCE_KEY, userId);
  }

  async getOnlineUserIds(): Promise<string[]> {
    const cutoff = Date.now() - HEARTBEAT_TIMEOUT_MS;
    return this.redis.zrangebyscore(PRESENCE_KEY, cutoff, '+inf');
  }

  async isOnline(userId: string): Promise<boolean> {
    const online = await this.getOnlineUserIds();
    return online.includes(userId);
  }
}
