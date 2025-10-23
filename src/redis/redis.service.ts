import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Redis from 'ioredis';
import { SeatUpdatesMessageEvent } from 'src/types';

@Injectable()
export class RedisService implements OnModuleDestroy, OnModuleInit {
  public db: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    const redis = new Redis(this.configService.get('REDIS_URL') as string);

    redis.on('connect', () => {
      this.logger.log(`Connected to Redis`);
    });

    redis.on('error', (e) => {
      this.logger.error(`Error connecting to Redis`, e);
    });

    this.db = redis;
  }

  // Subsribe to expiration events from Redis
  // specifically
  async onModuleInit() {
    // We need a new Redis client
    // since we're gonna use `subscribe` method.
    // When a redis client call the `subcribe` method,
    // the client connection goes into subcriber mode
    // and it can only call GET and SET methods
    // -- That's why we need a new Redis client
    const subscriberClient = new Redis(
      this.configService.get('REDIS_URL') as string,
    );

    await subscriberClient.subscribe('__keyevent@0__:expired');
    this.logger.log('Subsribed to expiration events');

    subscriberClient.on('message', (channel, message) => {
      this.logger.log(`Got message from ${channel}: ${message}`);

      // Handle the case for locked seats expiration
      if (message.startsWith('locked-seats')) {
        const [prefix, seatIdentifier] = message.split(':');
        const scheduleId = prefix.split('_').pop()!;

        const messageEvent: SeatUpdatesMessageEvent = {
          data: {
            event: 'seat-unlocked',
            data: [seatIdentifier],
          },
        };

        this.logger.log(`Emitting locked-seats-update:${scheduleId}`);
        this.eventEmitter.emit(
          `locked-seats-update:${scheduleId}`,
          messageEvent,
        );
      }
    });
  }

  async onModuleDestroy() {
    await this.db.quit();
  }
}
