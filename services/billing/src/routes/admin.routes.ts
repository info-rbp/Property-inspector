
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { requireServiceAuth } from '../middleware/auth'; // Using service auth for admin simplicity in MVP
import { addDays } from 'date-fns';
import { PlanCode, SubscriptionStatus } from '@prisma/client';
import { config } from '../config';

const router = Router();

const createSubSchema = z.object({
  tenantId: z.string(),
  planCode: z.nativeEnum(PlanCode),
  isTrial: z.boolean().default(false),
});

// Provision Subscription (Called by Auth Service on signup or Admin)
router.post('/subscription', requireServiceAuth, async (req, res) => {
  try {
    const { tenantId, planCode, isTrial } = createSubSchema.parse(req.body);

    const plan = await prisma.plan.findUnique({ where: { code: planCode } });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    // Close existing active subscriptions
    await prisma.subscription.updateMany({
        where: { tenantId, status: SubscriptionStatus.ACTIVE },
        data: { status: SubscriptionStatus.CANCELLED }
    });

    const now = new Date();
    const periodEnd = addDays(now, config.BILLING_PERIOD_DAYS);
    const trialEnd = isTrial ? addDays(now, config.DEFAULT_TRIAL_DAYS) : null;

    const sub = await prisma.subscription.create({
      data: {
        tenantId,
        planId: plan.id,
        status: isTrial ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
        billingPeriodStart: now,
        billingPeriodEnd: periodEnd,
        trialEndsAt: trialEnd,
      },
    });

    res.json(sub);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
