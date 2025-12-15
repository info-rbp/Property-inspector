"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
const pdf_1 = require("./services/pdf");
const app = (0, express_1.default)();
// Security & Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' })); // PDF payloads can be large
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});
// API Routes
app.use('/v1', routes_1.default);
// Start Server
const startServer = async () => {
    try {
        // Pre-warm Playwright
        await pdf_1.pdfService.init();
        app.listen(config_1.config.port, () => {
            console.log(`Report Service running on port ${config_1.config.port}`);
            console.log(`Project: ${config_1.config.projectId}`);
            console.log(`Environment: ${config_1.config.isDev ? 'Development' : 'Production'}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Graceful Shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing browser...');
    await pdf_1.pdfService.close();
    process.exit(0);
});
startServer();
