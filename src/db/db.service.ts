import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import {
  departure,
  destination,
  payment,
  schedule,
  seat,
  ticket,
} from './schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ConfigService } from '@nestjs/config';

export const schema = {
  departure,
  destination,
  payment,
  schedule,
  seat,
  ticket,
};

type Schema = typeof schema;

@Injectable()
export class DbService {
  public db: NodePgDatabase<Schema>;

  constructor(private readonly configService: ConfigService) {
    this.db = drizzle(this.configService.get('DATABASE_URL') as string, {
      schema,
    });
  }
}
