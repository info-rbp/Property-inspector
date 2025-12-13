import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string().url(),
  
  // Auth
  JWT_JWKS_URL: z.string().url(),
  SERVICE_AUTH_SECRET: z.string().min(16),

  // Service URLs
  MEDIA_SERVICE_URL: z.string().url(),
  BILLING_SERVICE_URL: z.string().url(),
  JOBS_SERVICE_URL: z.string().url(),
  AUDIT_SERVICE_URL: z.string().url(),
  REPORT_SERVICE_URL: z.string().url(),

  // Feature Flags
  DEMO_MODE: z.string().transform(val => val === 'true').default('false'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;