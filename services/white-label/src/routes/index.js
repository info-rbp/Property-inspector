"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const brandingController = __importStar(require("../controllers/branding.js"));
const assetsController = __importStar(require("../controllers/assets.js"));
const validate = __importStar(require("../middleware/validate.js"));
const auth = __importStar(require("../middleware/auth.js"));
const router = (0, express_1.Router)();
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
router.patch('/branding', auth.requireRole(['tenant_admin', 'platform_admin']), validate.validate(validate.updateBrandingSchema), brandingController.updateBranding);
// Select Template
router.post('/branding/select-template', auth.requireRole(['tenant_admin', 'platform_admin']), validate.validate(validate.selectTemplateSchema), brandingController.selectTemplate);
// Assets
router.post('/branding/assets/initiate-upload', auth.requireRole(['tenant_admin', 'platform_admin']), validate.validate(validate.initiateUploadSchema), assetsController.initiateUpload);
router.post('/branding/assets/complete-upload', auth.requireRole(['tenant_admin', 'platform_admin']), validate.validate(validate.completeUploadSchema), assetsController.completeUpload);
router.get('/branding/assets/:assetType', assetsController.getAssetUrl);
// --- Admin Tenant Access ---
router.get('/tenants/:tenantId/branding', auth.authenticate, auth.ensureTenantAccess, brandingController.getBranding);
exports.default = router;
