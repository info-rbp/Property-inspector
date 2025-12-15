"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
const app = (0, express_1.default)();
// Security & Utility Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '5mb' })); // Allow slightly larger bodies before offloading logic kicks in
app.use((0, morgan_1.default)('combined'));
// Routes
app.use('/v1/audit', audit_routes_1.default);
// Health Check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Audit Service running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
