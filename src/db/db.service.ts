import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as _schema from './schema';
import * as relations from './relations';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/env';

type Schema = typeof _schema & typeof relations;

export const schema: Schema = {
  ..._schema,
  ...relations,
};

@Injectable()
export class DbService {
  public db: NodePgDatabase<Schema>;

  constructor(private readonly configService: ConfigService<Env>) {
    const isTesting = configService.get('NODE_ENV') === 'testing';
    const databaseUrlKey = isTesting ? 'TEST_DATABASE_URL' : 'DATABASE_URL';

    const databaseUrl = this.configService.get<string>(databaseUrlKey);
    if (!databaseUrl) {
      throw new Error(
        `Value of '${databaseUrlKey}' does not exist in environment variables`,
      );
    }

    this.db = drizzle(databaseUrl, {
      schema,
      logger: configService.get('NODE_ENV') !== 'production',
    });
  }
}
