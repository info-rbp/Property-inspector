
import { prisma } from '../lib/db';
import { SubscriptionStatus } from '@prisma/client';

export const getActiveSubscription = async (tenantId: string) => {
  const now = new Date();

  // Find a subscription that is active (or trialing) and the current date is within the billing period
  const sub = await prisma.subscription.findFirst({
    where: {
      tenantId,
      status: {
        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
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
