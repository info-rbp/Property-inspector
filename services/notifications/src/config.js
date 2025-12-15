"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 8080,
    env: process.env.NODE_ENV || 'development',
    db: {
        url: process.env.DATABASE_URL,
    },
    security: {
        serviceAuthSecret: process.env.SERVICE_AUTH_SECRET,
        jwtJwksUrl: process.env.JWT_JWKS_URL,
    },
    services: {
        brandingBaseUrl: process.env.BRANDING_SERVICE_URL,
        reportBaseUrl: process.env.REPORT_SERVICE_URL,
    },
    cloudTasks: {
        project: process.env.CLOUD_TASKS_PROJECT || 'local',
        queue: process.env.CLOUD_TASKS_QUEUE || 'default',
        location: process.env.CLOUD_TASKS_LOCATION || 'us-central1',
        workerUrl: process.env.WORKER_URL || 'http://localhost:8080/internal/worker/deliver',
    },
    logic: {
        maxAttempts: Number(process.env.MAX_ATTEMPTS) || 5,
    },
    smtp: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.SMTP_FROM_EMAIL || 'no-reply@example.com',
    },
};
