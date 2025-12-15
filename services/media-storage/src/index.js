"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const routes_1 = require("./api/routes");
const processor_1 = require("./worker/processor");
const auth_1 = require("./api/middleware/auth");
const firestore_1 = require("./storage/firestore");
const gcs_1 = require("./storage/gcs");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Standard Health Check
app.get('/health', (_req, res) => {
    res.json({
        service: "media-storage",
        status: "ok",
        time: new Date().toISOString(),
    });
});
// Deep Ready Check (Dependencies)
app.get('/ready', async (_req, res) => {
    try {
        // Check Firestore
        await firestore_1.db.listCollections();
        // Check Storage
        const [exists] = await gcs_1.bucket.exists();
        if (!exists)
            throw new Error("Bucket access check failed");
        res.json({ ready: true });
    }
    catch (e) {
        res.status(503).json({ ready: false, error: String(e?.message ?? e) });
    }
});
// Worker Endpoint (Protected by Service Auth)
app.post('/events/process-media', auth_1.requireServiceAuth, processor_1.processMediaHandler);
// API Routes
app.use('/v1', routes_1.mediaRoutes);
app.listen(config_1.config.PORT, () => {
    console.log(`Media Service running on port ${config_1.config.PORT}`);
    console.log(`Environment: ${config_1.config.GCLOUD_PROJECT}`);
});
