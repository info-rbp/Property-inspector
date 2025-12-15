"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveSubscription = void 0;
const db_1 = require("../lib/db");
const client_1 = require("@prisma/client");
const getActiveSubscription = async (tenantId) => {
    const now = new Date();
    // Find a subscription that is active (or trialing) and the current date is within the billing period
    const sub = await db_1.prisma.subscription.findFirst({
        where: {
            tenantId,
            status: {
                in: [client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.TRIALING],
            },
            billingPeriodStart: { lte: now },
            billingPeriodEnd: { gte: now },
        },
        include: {
            plan: true,
        },
    });
    return sub;
};
exports.getActiveSubscription = getActiveSubscription;
