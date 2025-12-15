"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsageSummary = exports.recordUsage = void 0;
const db_1 = require("../lib/db");
const subscription_service_1 = require("./subscription.service");
const config_1 = require("../config");
const entitlement_service_1 = require("./entitlement.service");
const recordUsage = async (data) => {
    const { tenantId, usageType, quantity, sourceService, sourceEntityId } = data;
    // 1. Resolve Subscription
    // We record usage against the currently active subscription
    const subscription = await (0, subscription_service_1.getActiveSubscription)(tenantId);
    if (!subscription) {
        throw new Error(`No active subscription found for tenant ${tenantId}`);
    }
    // 2. Strict Mode Check (Optional)
    // Ensures that an entitlement check was passed before recording usage.
    // In a distributed system, this might be too chatty, so it's configurable.
    if (config_1.config.ENABLE_STRICT_USAGE_CHECKS) {
        const entitlement = await (0, entitlement_service_1.checkEntitlement)(tenantId, usageType, quantity);
        if (!entitlement.allowed) {
            throw new Error(`Usage rejected: Entitlement check failed for ${usageType}`);
        }
    }
    // 3. Transactional Write
    // Create the event AND update the aggregate in one go.
    try {
        const result = await db_1.prisma.$transaction(async (tx) => {
            // A. Create Immutable Event
            const event = await tx.usageEvent.create({
                data: {
                    tenantId,
                    subscriptionId: subscription.id,
                    usageType,
                    quantity,
                    sourceService,
                    sourceEntityId,
                },
            });
            // B. Upsert Aggregate
            const aggregate = await tx.usageAggregate.upsert({
                where: {
                    subscriptionId_usageType_billingPeriodStart: {
                        subscriptionId: subscription.id,
                        usageType: usageType,
                        billingPeriodStart: subscription.billingPeriodStart,
                    },
                },
                update: {
                    totalQuantity: { increment: quantity },
                },
                create: {
                    tenantId,
                    subscriptionId: subscription.id,
                    usageType,
                    totalQuantity: quantity,
                    billingPeriodStart: subscription.billingPeriodStart,
                    billingPeriodEnd: subscription.billingPeriodEnd,
                },
            });
            return { event, aggregate };
        });
        return result;
    }
    catch (error) {
        // Handle Unique Constraint Violation (Idempotency)
        if (error.code === 'P2002') {
            // Return existing record (idempotent success)
            console.warn(`Idempotency hit: ${sourceService}:${sourceEntityId} for ${usageType}`);
            return { status: 'skipped_duplicate' };
        }
        throw error;
    }
};
exports.recordUsage = recordUsage;
const getUsageSummary = async (tenantId) => {
    const subscription = await (0, subscription_service_1.getActiveSubscription)(tenantId);
    if (!subscription)
        return null;
    const limits = subscription.plan.limits;
    // Fetch all aggregates for this period
    const aggregates = await db_1.prisma.usageAggregate.findMany({
        where: {
            subscriptionId: subscription.id,
            billingPeriodStart: subscription.billingPeriodStart,
        },
    });
    // Map limits to usage
    const summary = Object.keys(limits).map((key) => {
        const usageRecord = aggregates.find((agg) => agg.usageType === key);
        const usage = usageRecord ? usageRecord.totalQuantity : 0;
        const limit = limits[key];
        // Forecast (Simple linear projection)
        const totalDays = (subscription.billingPeriodEnd.getTime() - subscription.billingPeriodStart.getTime()) / (1000 * 3600 * 24);
        const daysElapsed = (new Date().getTime() - subscription.billingPeriodStart.getTime()) / (1000 * 3600 * 24);
        const dailyRate = daysElapsed > 0 ? usage / daysElapsed : 0;
        const projectedTotal = Math.floor(usage + (dailyRate * (totalDays - daysElapsed)));
        return {
            usageType: key,
            limit,
            usage,
            remaining: Math.max(0, limit - usage),
            projectedUsage: projectedTotal,
            isExceeded: usage > limit,
            daysUntilExceeded: (dailyRate > 0 && usage < limit)
                ? Math.floor((limit - usage) / dailyRate)
                : null
        };
    });
    return {
        subscription: {
            id: subscription.id,
            planName: subscription.plan.name,
            status: subscription.status,
            periodStart: subscription.billingPeriodStart,
            periodEnd: subscription.billingPeriodEnd,
        },
        usage: summary
    };
};
exports.getUsageSummary = getUsageSummary;
