
import { Router } from 'express';
import { z } from 'zod';
import { checkEntitlement } from '../services/entitlement.service';
import { recordUsage, getUsageSummary } from '../services/metering.service';
import { requireAnyAuth, requireServiceAuth, requireTenantAuth } from '../middleware/auth';

const router = Router();

// Validation Schemas
const checkEntitlementSchema = z.object({
  tenantId: z.string(),
  usageType: z.string(),
  quantity: z.number().int().positive().default(1),
});

const recordUsageSchema = z.object({
  tenantId: z.string(),
  usageType: z.string(),
  quantity: z.number().int(), // Can be negative for corrections
  sourceService: z.string(),
  sourceEntityId: z.string(),
});

// 1. Check Entitlement
// Accessible by Services (before action) or Frontend (UI checking)
router.post('/entitlements/check', requireAnyAuth, async (req, res) => {
  try {
    const body = checkEntitlementSchema.parse(req.body);
    
    // Security check: If not internal service, ensure tenantId matches token
    if (!req.isService && req.user?.tenantId !== body.tenantId) {
       return res.status(403).json({ error: 'Tenant ID mismatch' });
    }

    const result = await checkEntitlement(body.tenantId, body.usageType, body.quantity);
    
    if (!result.allowed) {
        return res.status(403).json(result); // 403 indicates denied logic
    }
    
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 2. Record Usage
// Accessible ONLY by Internal Services
router.post('/usage', requireServiceAuth, async (req, res) => {
  try {
    const body = recordUsageSchema.parse(req.body);
    const result = await recordUsage(body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Get Usage Summary
// Accessible by Tenant Admin
router.get('/usage/summary', requireTenantAuth, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId; // From JWT
    const summary = await getUsageSummary(tenantId);
    
    if (!summary) {
        return res.status(404).json({ error: 'No active subscription found' });
    }

    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
