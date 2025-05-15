import { TokenStorePort } from 'src/core/application/login/ports/token-store.port';
import { RedisService } from './redis.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisTokenStore implements TokenStorePort {
  constructor(private readonly redisService: RedisService) {}

  async save(userId: string, token: string, timeStore?: number): Promise<void> {
    await this.redisService.set(
      `auth_token:${userId}`,
      token,
      'EX',
      timeStore ?? 3600,
    );
  }
}
