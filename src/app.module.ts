import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';
import { DeparturesModule } from './departures/departures.module';
import { TicketsModule } from './tickets/tickets.module';
import { RedisModule } from './redis/redis.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
        PORT: Joi.number().port().default(5050),
        REDIS_URL: Joi.string().uri(),
        DATABASE_URL: Joi.string().uri(),
      }),
    }),
    DbModule,
    DeparturesModule,
    TicketsModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
