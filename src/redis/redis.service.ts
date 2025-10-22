import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public db: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    const redis = new Redis(this.configService.get('REDIS_URL') as string);

    redis.on('connect', () => {
      this.logger.log(`Connected to Redis`);
    });

    redis.on('error', (e) => {
      this.logger.error(`Error connecting to Redis`, e);
    });

    this.db = redis;
  }

  async onModuleDestroy() {
    await this.db.quit();
  }
}
