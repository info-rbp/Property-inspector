"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseClient = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
class BaseClient {
    client;
    serviceName;
    constructor(serviceName, baseURL) {
        this.serviceName = serviceName;
        this.client = axios_1.default.create({
            baseURL,
            timeout: 3000, // Strict 3s timeout
        });
        this.client.interceptors.request.use(config => {
            // Inject Service Auth Header for internal traffic
            config.headers['X-Service-Auth'] = env_1.env.SERVICE_AUTH_SECRET;
            // In a real request context, we would inject the incoming correlation ID
            // For now, simple client config
            return config;
        });
    }
    handleError(error, context) {
        if (axios_1.default.isAxiosError(error)) {
            const ae = error;
            throw new Error(`[${this.serviceName}] ${context}: ${ae.message} (${ae.response?.status ?? 'No Status'})`);
        }
        throw error;
    }
    async healthCheck() {
        const start = performance.now();
        try {
            await this.client.get('/v1/health');
            return { status: 'ok', latency: Math.round(performance.now() - start) };
        }
        catch (e) {
            return { status: 'error', latency: Math.round(performance.now() - start) };
        }
    }
}
exports.BaseClient = BaseClient;
