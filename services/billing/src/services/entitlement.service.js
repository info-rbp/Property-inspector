"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEntitlement = void 0;
const db_1 = require("../lib/db");
const subscription_service_1 = require("./subscription.service");
const checkEntitlement = async (tenantId, usageType, requestedQuantity = 1) => {
    const subscription = await (0, subscription_service_1.getActiveSubscription)(tenantId);
    if (!subscription) {
        return {
            allowed: false,
            limit: 0,
            remaining: 0,
            usage: 0,
            periodEndsAt: new Date(),
            reason: 'subscription_inactive',
            upgradeRequired: true,
        };
    }
    const limits = subscription.plan.limits;
    const rules = subscription.plan.overageRules;
    // If the plan doesn't mention this usage type, assume it's not allowed or unlimited?
    // Policy: If limit is undefined, it is NOT ALLOWED (Fail Closed)
    const limit = limits[usageType];
    if (limit === undefined) {
        return {
            allowed: false,
            limit: 0,
            remaining: 0,
            usage: 0,
            periodEndsAt: subscription.billingPeriodEnd,
            reason: 'limit_exceeded', // Or 'feature_not_included'
            upgradeRequired: true,
        };
    }
    // Get current usage from Aggregates
    const aggregate = await db_1.prisma.usageAggregate.findUnique({
        where: {
            subscriptionId_usageType_billingPeriodStart: {
                subscriptionId: subscription.id,
                usageType: usageType,
                billingPeriodStart: subscription.billingPeriodStart,
            },
        },
    });
    const currentUsage = aggregate ? aggregate.totalQuantity : 0;
    const projectedUsage = currentUsage + requestedQuantity;
    const remaining = Math.max(0, limit - currentUsage);
    // Check Logic
    const isWithinLimit = projectedUsage <= limit;
    let allowed = isWithinLimit;
    // Handle Soft Limits / Overages
    if (!isWithinLimit && rules.allowOverage) {
        allowed = true; // Allowed, but will be marked as overage in reporting later
    }
    // Hard Stop Override
    if (!isWithinLimit && rules.hardStop) {
        allowed = false;
    }
    return {
        allowed,
        limit,
        remaining: isWithinLimit ? limit - projectedUsage : 0,
        usage: currentUsage,
        periodEndsAt: subscription.billingPeriodEnd,
        reason: allowed ? 'within_plan' : 'limit_exceeded',
        upgradeRequired: !allowed,
    };
};
exports.checkEntitlement = checkEntitlement;
