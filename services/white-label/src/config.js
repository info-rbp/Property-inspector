"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const configSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('8080'),
    GCP_PROJECT_ID: zod_1.z.string(),
    BRANDING_BUCKET_NAME: zod_1.z.string(),
    FIRESTORE_DATABASE_ID: zod_1.z.string().optional(),
    SIGNED_URL_TTL_SECONDS: zod_1.z.coerce.number().default(900),
    MAX_ASSET_SIZE_BYTES: zod_1.z.coerce.number().default(5000000), // 5MB
    JWT_PUBLIC_KEY: zod_1.z.string().optional(), // In prod, prefer JWKS_URL
    SERVICE_AUTH_SECRET: zod_1.z.string().optional(),
    ALLOWED_FONTS: zod_1.z.string().transform(str => str.split(',')).default('system,inter,roboto'),
    ALLOW_SVG: zod_1.z.string().transform(str => str === 'true').default('false'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development')
});
const parseConfig = () => {
    try {
        return configSchema.parse(process.env);
    }
    catch (error) {
        console.error('❌ Invalid environment configuration:', error);
        process.exit(1);
    }
};
exports.config = parseConfig();
