"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const entitlement_service_1 = require("../services/entitlement.service");
const metering_service_1 = require("../services/metering.service");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Validation Schemas
const checkEntitlementSchema = zod_1.z.object({
    tenantId: zod_1.z.string(),
    usageType: zod_1.z.string(),
    quantity: zod_1.z.number().int().positive().default(1),
});
const recordUsageSchema = zod_1.z.object({
    tenantId: zod_1.z.string(),
    usageType: zod_1.z.string(),
    quantity: zod_1.z.number().int(), // Can be negative for corrections
    sourceService: zod_1.z.string(),
    sourceEntityId: zod_1.z.string(),
});
// 1. Check Entitlement
// Accessible by Services (before action) or Frontend (UI checking)
router.post('/entitlements/check', auth_1.requireAnyAuth, async (req, res) => {
    try {
        const body = checkEntitlementSchema.parse(req.body);
        // Security check: If not internal service, ensure tenantId matches token
        if (!req.isService && req.user?.tenantId !== body.tenantId) {
            return res.status(403).json({ error: 'Tenant ID mismatch' });
        }
        const result = await (0, entitlement_service_1.checkEntitlement)(body.tenantId, body.usageType, body.quantity);
        if (!result.allowed) {
            return res.status(403).json(result); // 403 indicates denied logic
        }
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 2. Record Usage
// Accessible ONLY by Internal Services
router.post('/usage', auth_1.requireServiceAuth, async (req, res) => {
    try {
        const body = recordUsageSchema.parse(req.body);
        const result = await (0, metering_service_1.recordUsage)(body);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 3. Get Usage Summary
// Accessible by Tenant Admin
router.get('/usage/summary', auth_1.requireTenantAuth, async (req, res) => {
    try {
        const tenantId = req.user.tenantId; // From JWT
        const summary = await (0, metering_service_1.getUsageSummary)(tenantId);
        if (!summary) {
            return res.status(404).json({ error: 'No active subscription found' });
        }
        res.json(summary);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
