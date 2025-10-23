import { defineConfig } from 'drizzle-kit';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();
const isTesting = configService.get('NODE_ENV') === 'testing';
const databaseUrlKey = isTesting ? 'TEST_DATABASE_URL' : 'DATABASE_URL';
const url = configService.get(databaseUrlKey) as string;

if (!url) {
  console.error(
    `Value of '${databaseUrlKey}' does not exist in environment variables`,
  );
  process.exit(1);
}

export default defineConfig({
  out: './drizzle',
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  dbCredentials: {
    url,
  },
});
