import { prisma } from '../lib/db';
import { getActiveSubscription } from './subscription.service';
import { config } from '../config';
import { checkEntitlement } from './entitlement.service';
import { PlanLimits } from '../types';

interface UsageRecordRequest {
  tenantId: string;
  usageType: string;
  quantity: number;
  sourceService: string;
  sourceEntityId: string;
}

export const recordUsage = async (data: UsageRecordRequest) => {
  const { tenantId, usageType, quantity, sourceService, sourceEntityId } = data;

  // 1. Resolve Subscription
  // We record usage against the currently active subscription
  const subscription = await getActiveSubscription(tenantId);

  if (!subscription) {
    throw new Error(`No active subscription found for tenant ${tenantId}`);
  }

  // 2. Strict Mode Check (Optional)
  // Ensures that an entitlement check was passed before recording usage.
  // In a distributed system, this might be too chatty, so it's configurable.
  if (config.ENABLE_STRICT_USAGE_CHECKS) {
    const entitlement = await checkEntitlement(tenantId, usageType, quantity);
    if (!entitlement.allowed) {
      throw new Error(`Usage rejected: Entitlement check failed for ${usageType}`);
    }
  }

  // 3. Transactional Write
  // Create the event AND update the aggregate in one go.
  try {
    const result = await prisma.$transaction(async (tx) => {
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
  } catch (error: any) {
    // Handle Unique Constraint Violation (Idempotency)
    if (error.code === 'P2002') {
      // Return existing record (idempotent success)
      console.warn(`Idempotency hit: ${sourceService}:${sourceEntityId} for ${usageType}`);
      return { status: 'skipped_duplicate' }; 
    }
    throw error;
  }
};

export const getUsageSummary = async (tenantId: string) => {
  const subscription = await getActiveSubscription(tenantId);
  if (!subscription) return null;

  const limits = subscription.plan.limits as unknown as PlanLimits;
  
  // Fetch all aggregates for this period
  const aggregates = await prisma.usageAggregate.findMany({
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