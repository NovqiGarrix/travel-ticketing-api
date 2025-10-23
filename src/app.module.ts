import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { DeparturesModule } from './departures/departures.module';
import { RedisModule } from './redis/redis.module';
import { SchedulesModule } from './schedules/schedules.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'testing')
          .default('development'),
        PORT: Joi.number().port().default(5050),
        REDIS_URL: Joi.string().uri(),
        DATABASE_URL: Joi.string().uri(),
      }),
    }),
    EventEmitterModule.forRoot(),
    DbModule,
    DeparturesModule,
    TicketsModule,
    RedisModule,
    SchedulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
