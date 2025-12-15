export declare const config: {
    NODE_ENV: "test" | "development" | "production";
    PORT: string;
    SIGNED_URL_TTL_SECONDS: number;
    GCP_PROJECT_ID: string;
    BRANDING_BUCKET_NAME: string;
    MAX_ASSET_SIZE_BYTES: number;
    ALLOWED_FONTS: string[];
    ALLOW_SVG: boolean;
    SERVICE_AUTH_SECRET?: string | undefined;
    JWT_PUBLIC_KEY?: string | undefined;
    FIRESTORE_DATABASE_ID?: string | undefined;
} | undefined;
