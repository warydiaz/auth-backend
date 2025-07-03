import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: RedisClient;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });

    this.client.on('error', (err: Error) => {
      console.error('Redis error:', err);
    });
  }

  async set(
    key: string,
    value: string,
    mode: 'EX' | 'PX',
    duration: number,
  ): Promise<'OK'> {
    if (mode === 'EX') {
      return this.client.set(key, value, 'EX', duration);
    } else {
      return this.client.set(key, value, 'PX', duration);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
