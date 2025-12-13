import { Router } from 'express';
import * as brandingController from '../controllers/branding.js';
import * as assetsController from '../controllers/assets.js';
import * as validate from '../middleware/validate.js';
import * as auth from '../middleware/auth.js';

const router = Router();

// --- Public / Health ---
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// --- Templates (Authenticated) ---
router.use('/templates', auth.authenticate);
router.get('/templates', brandingController.listTemplates);
router.get('/templates/:templateId', brandingController.getTemplate);

// --- Branding (Authenticated) ---
router.use('/branding', auth.authenticate);

// Get my branding
router.get('/branding', brandingController.getBranding);

// Bootstrap (Bonus)
router.get('/branding/bootstrap', brandingController.getBranding); // Reusing logic as it covers requirements

// Update my branding
router.patch('/branding', 
    auth.requireRole(['tenant_admin', 'platform_admin']),
    validate.validate(validate.updateBrandingSchema),
    brandingController.updateBranding
);

// Select Template
router.post('/branding/select-template',
    auth.requireRole(['tenant_admin', 'platform_admin']),
    validate.validate(validate.selectTemplateSchema),
    brandingController.selectTemplate
);

// Assets
router.post('/branding/assets/initiate-upload',
    auth.requireRole(['tenant_admin', 'platform_admin']),
    validate.validate(validate.initiateUploadSchema),
    assetsController.initiateUpload
);

router.post('/branding/assets/complete-upload',
    auth.requireRole(['tenant_admin', 'platform_admin']),
    validate.validate(validate.completeUploadSchema),
    assetsController.completeUpload
);

router.get('/branding/assets/:assetType',
    assetsController.getAssetUrl
);

// --- Admin Tenant Access ---
router.get('/tenants/:tenantId/branding',
    auth.authenticate,
    auth.ensureTenantAccess,
    brandingController.getBranding
);

export default router;