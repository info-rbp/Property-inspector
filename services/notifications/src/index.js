"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
const logger_1 = __importDefault(require("./utils/logger"));
const process_1 = __importDefault(require("process"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
// Routes
app.use(routes_1.default);
const server = app.listen(config_1.config.port, () => {
    logger_1.default.info(`Notification Service running on port ${config_1.config.port}`);
    logger_1.default.info(`Environment: ${config_1.config.env}`);
});
process_1.default.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger_1.default.info('HTTP server closed');
    });
});
