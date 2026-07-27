import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
  dotenv.config(); // fallback to local .env
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_BASE_URL: z.string().default('http://localhost:4000'),
  WEB_BASE_URL: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().optional(),
  ENCRYPTION_MASTER_KEY: z.string().default('a'.repeat(64)),
  JWT_SECRET: z.string().default('default_jwt_secret_key_change_me_in_production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  RATE_LIMIT_SVG_PER_MINUTE: z.coerce.number().default(100),
  RATE_LIMIT_API_PER_MINUTE: z.coerce.number().default(1000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
