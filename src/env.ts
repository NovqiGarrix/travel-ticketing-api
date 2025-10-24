import z from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'testing'])
    .default('development'),
  PORT: z.string().default('8080').transform(Number),
  REDIS_URL: z.string(),
  DATABASE_URL: z.string(),
  CLIENT_URL: z.url().default('http://localhost:3000'),
  TEST_DATABASE_URL: z.string().optional(),
  XENDIT_SECRET_KEY: z.string(),
  XENDIT_WEBHOOK_TOKEN_VERIFICATION: z.string(),
});

export type Env = z.infer<typeof envSchema>;
