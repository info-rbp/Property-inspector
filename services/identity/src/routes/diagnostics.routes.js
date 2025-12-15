"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const runtime_1 = require("../utils/runtime");
const readiness_1 = require("../diagnostics/readiness");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Liveness Check
// GET /v1/health
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: (0, runtime_1.getServiceName)(),
        version: (0, runtime_1.getVersion)(),
        time: (0, runtime_1.getIsoTimeNow)(),
        uptimeSeconds: (0, runtime_1.getUptimeSeconds)(),
        commitSha: (0, runtime_1.getCommitSha)()
    });
});
// Readiness Check
// GET /v1/ready
router.get('/ready', async (req, res) => {
    const result = await (0, readiness_1.runReadinessChecks)();
    // Return 503 if not ready to signal load balancers to stop sending traffic
    const statusCode = result.ready ? 200 : 503;
    res.status(statusCode).json(result);
});
// Service Auth Verification Endpoint
// GET /v1/echo-service-auth
router.get('/echo-service-auth', auth_middleware_1.requireServiceAuth, (req, res) => {
    res.json({
        message: 'Service Authentication Successful',
        serviceAuthValid: true,
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
