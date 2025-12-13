import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  NODE_ENV: z.string().default('production'),
  
  // JWT Configuration
  JWT_ISSUER: z.string(),
  JWT_AUDIENCE: z.string(),
  JWT_ACCESS_TTL_MIN: z.string().transform(Number).default('15'),
  JWT_REFRESH_TTL_DAYS: z.string().transform(Number).default('7'),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  // Optional: JSON array of strings for rotating keys
  JWT_PUBLIC_KEYS: z.string().optional(),
  JWKS_CACHE_TTL_SECONDS: z.string().transform(Number).default('3600'),
  
  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  SERVICE_AUTH_SECRET: z.string().min(16, "Service auth secret too short"),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_SEC: z.string().transform(Number).default('900'),
  RATE_LIMIT_MAX_ATTEMPTS: z.string().transform(Number).default('100'),

  // External Services
  NOTIFICATIONS_SERVICE_URL: z.string().url(),
  BILLING_SERVICE_URL: z.string().url().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsedEnv.error.format(), null, 2));
  (process as any).exit(1);
}

export const config = parsedEnv.data;