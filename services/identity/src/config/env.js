"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('3000'),
    DATABASE_URL: zod_1.z.string(),
    NODE_ENV: zod_1.z.string().default('production'),
    // JWT Configuration
    JWT_ISSUER: zod_1.z.string(),
    JWT_AUDIENCE: zod_1.z.string(),
    JWT_ACCESS_TTL_MIN: zod_1.z.string().transform(Number).default('15'),
    JWT_REFRESH_TTL_DAYS: zod_1.z.string().transform(Number).default('7'),
    JWT_PRIVATE_KEY: zod_1.z.string(),
    JWT_PUBLIC_KEY: zod_1.z.string(),
    // Optional: JSON array of strings for rotating keys
    JWT_PUBLIC_KEYS: zod_1.z.string().optional(),
    JWKS_CACHE_TTL_SECONDS: zod_1.z.string().transform(Number).default('3600'),
    // Security
    BCRYPT_ROUNDS: zod_1.z.string().transform(Number).default('12'),
    SERVICE_AUTH_SECRET: zod_1.z.string().min(16, "Service auth secret too short"),
    // Rate Limiting
    RATE_LIMIT_WINDOW_SEC: zod_1.z.string().transform(Number).default('900'),
    RATE_LIMIT_MAX_ATTEMPTS: zod_1.z.string().transform(Number).default('100'),
    // External Services
    NOTIFICATIONS_SERVICE_URL: zod_1.z.string().url(),
    BILLING_SERVICE_URL: zod_1.z.string().url().optional(),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsedEnv.error.format(), null, 2));
    process.exit(1);
}
exports.config = parsedEnv.data;
