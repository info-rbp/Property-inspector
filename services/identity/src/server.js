"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const dbCheck_1 = require("./startup/dbCheck");
async function bootstrap() {
    try {
        // 1. Check Database
        await (0, dbCheck_1.checkDatabaseConnection)();
        // 2. Start Server
        app_1.default.listen(env_1.config.PORT, () => {
            console.log(`🚀 Identity Service running on port ${env_1.config.PORT}`);
            console.log(`Health check: http://localhost:${env_1.config.PORT}/v1/health`);
            console.log(`JWKS: http://localhost:${env_1.config.PORT}/v1/.well-known/jwks.json`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
bootstrap();
