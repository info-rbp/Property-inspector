"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(8080),
    HOST: zod_1.z.string().default('0.0.0.0'),
    LOG_LEVEL: zod_1.z.string().default('info'),
    LOG_PRETTY: zod_1.z
        .union([zod_1.z.string(), zod_1.z.boolean()])
        .transform((value) => value === true || value === 'true')
        .default(false),
    CORS_ORIGIN: zod_1.z.string().optional(),
    RATE_LIMIT_MAX: zod_1.z.coerce.number().default(100),
    RATE_LIMIT_WINDOW: zod_1.z.string().default('1 minute'),
    JWT_SECRET: zod_1.z.string().default('change-me-in-production'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    JWT_ISSUER: zod_1.z.string().default('proinspect-gateway'),
    JWT_AUDIENCE: zod_1.z.string().default('proinspect-platform'),
    API_BASE_URL: zod_1.z.string().default('http://localhost:8080'),
    DATABASE_URL: zod_1.z.string().url(),
    JWT_JWKS_URL: zod_1.z.string().url(),
    SERVICE_AUTH_SECRET: zod_1.z.string().min(8),
    MEDIA_SERVICE_URL: zod_1.z.string().url(),
    BILLING_SERVICE_URL: zod_1.z.string().url(),
    JOBS_SERVICE_URL: zod_1.z.string().url(),
    AUDIT_SERVICE_URL: zod_1.z.string().url(),
    REPORT_SERVICE_URL: zod_1.z.string().url(),
    REDIS_URL: zod_1.z.string().optional(),
    GIT_COMMIT: zod_1.z.string().optional(),
    BUILD_TIME: zod_1.z.string().optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    throw new Error('Invalid environment variables');
}
const env = parsed.data;
const isProduction = env.NODE_ENV === 'production';
const requiredInProduction = [
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
exports.config = {
    ...env,
    corsOrigins: env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [
        'http://localhost:3000',
    ],
    PACKAGE_VERSION: process.env.npm_package_version || '1.0.0',
};
