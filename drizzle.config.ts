import { defineConfig } from 'drizzle-kit';

const isTesting = process.env.NODE_ENV === 'testing';
const databaseUrlKey = isTesting ? 'TEST_DATABASE_URL' : 'DATABASE_URL';
const url = process.env[databaseUrlKey] as string;

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
