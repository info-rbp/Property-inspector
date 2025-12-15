"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const billing_routes_1 = __importDefault(require("./routes/billing.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('combined'));
// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
// API Routes
app.use('/v1/billing', billing_routes_1.default);
app.use('/v1/admin/billing', admin_routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
exports.default = app;
