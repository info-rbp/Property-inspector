"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    PORT: process.env.PORT || 8080,
    GCLOUD_PROJECT: process.env.GCLOUD_PROJECT || 'local-project',
    GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME || 'media-bucket',
    PUBSUB_TOPIC: process.env.PUBSUB_TOPIC || 'media-processing',
    FIRESTORE_COLLECTION: 'media',
    FIRESTORE_RETENTION_COLLECTION: 'retention_policies',
    // Auth
    JWT_JWKS_URL: process.env.JWT_JWKS_URL || '',
    JWT_ISSUER: process.env.JWT_ISSUER || '',
    JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'pia-platform',
    SERVICE_AUTH_SECRET: process.env.SERVICE_AUTH_SECRET || 'change-me-local-secret',
    // Policies
    RETENTION_DAYS_DEFAULT: 365,
    UPLOAD_EXPIRY_MINUTES: 15,
    READ_EXPIRY_MINUTES: 15, // Short-lived read URLs
};
