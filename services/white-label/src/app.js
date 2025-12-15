"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const index_js_1 = __importDefault(require("./routes/index.js"));
const errors_js_1 = require("./utils/errors.js");
const app = (0, express_1.default)();
// Security headers
app.use((0, helmet_1.default)());
// CORS - In production configure this strictly
app.use((0, cors_1.default)());
// Parse JSON bodies
app.use(express_1.default.json());
// Request ID middleware
app.use((req, res, next) => {
    res.locals.requestId = req.headers['x-request-id'] || (0, uuid_1.v4)();
    next();
});
// Routes
app.use('/v1', index_js_1.default);
// 404
app.use((req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});
// Global Error Handler
app.use((err, req, res, next) => {
    (0, errors_js_1.handleError)(err, res);
});
exports.default = app;
