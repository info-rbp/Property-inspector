"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const errors_1 = require("./utils/errors");
const zod_1 = require("zod");
const app = (0, express_1.default)();
// Security Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('combined'));
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.config.RATE_LIMIT_WINDOW_SEC * 1000,
    max: env_1.config.RATE_LIMIT_MAX_ATTEMPTS,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/v1', limiter);
// Routes
app.use('/v1', routes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
                requestId: req.headers['x-request-id'] || 'unknown'
            }
        });
    }
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input data',
                details: err.errors,
                requestId: req.headers['x-request-id'] || 'unknown'
            }
        });
    }
    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
            requestId: req.headers['x-request-id'] || 'unknown'
        }
    });
});
exports.default = app;
