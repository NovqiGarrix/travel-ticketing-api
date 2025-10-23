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
    const isTesting = configService.get('NODE_ENV') === 'testing';
    const databaseUrlKey = isTesting ? 'TEST_DATABASE_URL' : 'DATABASE_URL';

    const databaseUrl = this.configService.get(databaseUrlKey) as string;
    if (!databaseUrl) {
      throw new Error(
        `Value of '${databaseUrlKey}' does not exist in environment variables`,
      );
    }

    this.db = drizzle(databaseUrl, { schema, logger: true });
  }
}
