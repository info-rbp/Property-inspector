
import { Router } from 'express';
import * as AuditController from '../controllers/audit.controller';
import { requireServiceAuth, requireTenantAuth, enforceTenantScope } from '../middleware/auth.middleware';

const router = Router();

// --- Internal Write API ---
// Protected by Shared Secret or IAM
router.post(
  '/events', 
  requireServiceAuth, 
  AuditController.createEvent
);

// --- Tenant Read API ---
// Protected by User JWT + Tenant Scoping

// Read history for specific entity
router.get(
  '/entities/:entityType/:entityId',
  requireTenantAuth,
  enforceTenantScope,
  AuditController.getEntityHistory
);

// Get Inspection Summary (Dispute/Compliance View)
router.get(
  '/inspections/:inspectionId/summary',
  requireTenantAuth,
  enforceTenantScope,
  AuditController.getInspectionSummary
);

// --- Admin Export ---
router.get(
  '/admin/export',
  requireTenantAuth, // In reality, check for specific 'admin' role permissions here too
  enforceTenantScope,
  AuditController.exportAuditLog
);

export default router;
