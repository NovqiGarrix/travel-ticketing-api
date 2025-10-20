import { defineConfig } from 'drizzle-kit';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export default defineConfig({
  out: './drizzle',
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  dbCredentials: {
    url: configService.get('DATABASE_URL') as string,
  },
});
