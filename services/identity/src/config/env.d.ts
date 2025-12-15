export declare const config: {
    NODE_ENV: string;
    PORT: string;
    JWT_ISSUER: string;
    JWT_AUDIENCE: string;
    DATABASE_URL: string;
    SERVICE_AUTH_SECRET: string;
    JWT_ACCESS_TTL_MIN: number;
    JWT_REFRESH_TTL_DAYS: number;
    JWT_PRIVATE_KEY: string;
    JWT_PUBLIC_KEY: string;
    JWKS_CACHE_TTL_SECONDS: number;
    BCRYPT_ROUNDS: number;
    RATE_LIMIT_WINDOW_SEC: number;
    RATE_LIMIT_MAX_ATTEMPTS: number;
    NOTIFICATIONS_SERVICE_URL: string;
    BILLING_SERVICE_URL?: string | undefined;
    JWT_PUBLIC_KEYS?: string | undefined;
} | undefined;
