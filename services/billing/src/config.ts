import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  SERVICE_AUTH_SECRET: z.string(),
  BILLING_PERIOD_DAYS: z.string().transform(Number).default('30'),
  ENABLE_STRICT_USAGE_CHECKS: z.string().transform((v) => v === 'true').default('false'),
  DEFAULT_TRIAL_DAYS: z.string().transform(Number).default('14'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  (process as any).exit(1);
}

export const config = parsed.data;