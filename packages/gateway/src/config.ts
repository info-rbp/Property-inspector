import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8080),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.string().default('info'),
  LOG_PRETTY: z
    .union([z.string(), z.boolean()])
    .transform((value) => value === true || value === 'true')
    .default(false),

  CORS_ORIGIN: z.string().optional(),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.string().default('1 minute'),

  JWT_SECRET: z.string().default('change-me-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_ISSUER: z.string().default('proinspect-gateway'),
  JWT_AUDIENCE: z.string().default('proinspect-platform'),

  API_BASE_URL: z.string().default('http://localhost:8080'),

  DATABASE_URL: z.string().url(),
  JWT_JWKS_URL: z.string().url(),
  SERVICE_AUTH_SECRET: z.string().min(8),

  MEDIA_SERVICE_URL: z.string().url(),
  BILLING_SERVICE_URL: z.string().url(),
  JOBS_SERVICE_URL: z.string().url(),
  AUDIT_SERVICE_URL: z.string().url(),
  REPORT_SERVICE_URL: z.string().url(),

  REDIS_URL: z.string().optional(),
  GIT_COMMIT: z.string().optional(),
  BUILD_TIME: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  throw new Error('Invalid environment variables');
}

const env = parsed.data;
const isProduction = env.NODE_ENV === 'production';

const requiredInProduction: Array<keyof typeof env> = [
  'DATABASE_URL',
  'JWT_JWKS_URL',
  'SERVICE_AUTH_SECRET',
  'MEDIA_SERVICE_URL',
  'BILLING_SERVICE_URL',
  'JOBS_SERVICE_URL',
  'AUDIT_SERVICE_URL',
  'REPORT_SERVICE_URL',
];

if (isProduction) {
  const missing = requiredInProduction.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`);
  }
}

export const config = {
  ...env,
  corsOrigins: env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [
    'http://localhost:3000',
  ],
  PACKAGE_VERSION: process.env.npm_package_version || '1.0.0',
};

export type AppConfig = typeof config;
