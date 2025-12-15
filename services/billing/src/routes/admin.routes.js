"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../lib/db");
const auth_1 = require("../middleware/auth"); // Using service auth for admin simplicity in MVP
const date_fns_1 = require("date-fns");
const client_1 = require("@prisma/client");
const config_1 = require("../config");
const router = (0, express_1.Router)();
const createSubSchema = zod_1.z.object({
    tenantId: zod_1.z.string(),
    planCode: zod_1.z.nativeEnum(client_1.PlanCode),
    isTrial: zod_1.z.boolean().default(false),
});
// Provision Subscription (Called by Auth Service on signup or Admin)
router.post('/subscription', auth_1.requireServiceAuth, async (req, res) => {
    try {
        const { tenantId, planCode, isTrial } = createSubSchema.parse(req.body);
        const plan = await db_1.prisma.plan.findUnique({ where: { code: planCode } });
        if (!plan)
            return res.status(404).json({ error: 'Plan not found' });
        // Close existing active subscriptions
        await db_1.prisma.subscription.updateMany({
            where: { tenantId, status: client_1.SubscriptionStatus.ACTIVE },
            data: { status: client_1.SubscriptionStatus.CANCELLED }
        });
        const now = new Date();
        const periodEnd = (0, date_fns_1.addDays)(now, config_1.config.BILLING_PERIOD_DAYS);
        const trialEnd = isTrial ? (0, date_fns_1.addDays)(now, config_1.config.DEFAULT_TRIAL_DAYS) : null;
        const sub = await db_1.prisma.subscription.create({
            data: {
                tenantId,
                planId: plan.id,
                status: isTrial ? client_1.SubscriptionStatus.TRIALING : client_1.SubscriptionStatus.ACTIVE,
                billingPeriodStart: now,
                billingPeriodEnd: periodEnd,
                trialEndsAt: trialEnd,
            },
        });
        res.json(sub);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
