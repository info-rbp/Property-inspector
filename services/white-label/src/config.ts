import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  PORT: z.string().default('8080'),
  GCP_PROJECT_ID: z.string(),
  BRANDING_BUCKET_NAME: z.string(),
  FIRESTORE_DATABASE_ID: z.string().optional(),
  SIGNED_URL_TTL_SECONDS: z.coerce.number().default(900),
  MAX_ASSET_SIZE_BYTES: z.coerce.number().default(5000000), // 5MB
  JWT_PUBLIC_KEY: z.string().optional(), // In prod, prefer JWKS_URL
  SERVICE_AUTH_SECRET: z.string().optional(),
  ALLOWED_FONTS: z.string().transform(str => str.split(',')).default('system,inter,roboto'),
  ALLOW_SVG: z.string().transform(str => str === 'true').default('false'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

const parseConfig = () => {
  try {
    return configSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment configuration:', error);
    (process as any).exit(1);
  }
};

export const config = parseConfig();