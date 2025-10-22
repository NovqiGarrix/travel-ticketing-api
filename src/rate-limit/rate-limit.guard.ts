import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { Request } from 'express';
import { v7 as genUUID } from 'uuid';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly LIMIT = 60;
  private readonly WINDOW_SIZE = 60; // 60 seconds

  constructor(private readonly redisService: RedisService) {}

  private getKey(request: Request) {
    return `rate_limit:${request.ip || '::1'}`;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Implement Sliding Window Log Algorithm using HSET and HEXPIRE
    const rateLimitKey = this.getKey(request);
    const currentCount = await this.redisService.db.hlen(rateLimitKey);
    if (currentCount > this.LIMIT) {
      // Client exedeed the limit
      return false;
    }

    // Add new timestamp to the HSET
    // and set expire date for the field
    const fieldKey = genUUID();
    const transaction = this.redisService.db.multi();
    transaction.call('HSET', rateLimitKey, fieldKey, '');
    transaction.call(
      'HEXPIRE',
      rateLimitKey,
      this.WINDOW_SIZE,
      'FIELDS',
      1,
      fieldKey,
    );
    await transaction.exec();

    request['rateLimitInfo'] = {
      limit: this.WINDOW_SIZE,
      remaining: this.LIMIT - currentCount + 1,
    };

    return true;
  }
}
