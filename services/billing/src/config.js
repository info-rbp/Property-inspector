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
    JWT_SECRET: zod_1.z.string(),
    SERVICE_AUTH_SECRET: zod_1.z.string(),
    BILLING_PERIOD_DAYS: zod_1.z.string().transform(Number).default('30'),
    ENABLE_STRICT_USAGE_CHECKS: zod_1.z.string().transform((v) => v === 'true').default('false'),
    DEFAULT_TRIAL_DAYS: zod_1.z.string().transform(Number).default('14'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());
    process.exit(1);
}
exports.config = parsed.data;
