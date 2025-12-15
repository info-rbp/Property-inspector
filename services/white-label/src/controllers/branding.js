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
exports.selectTemplate = exports.getTemplate = exports.listTemplates = exports.updateBranding = exports.getBranding = void 0;
const firestoreService = __importStar(require("../services/firestore.js"));
const storageService = __importStar(require("../services/storage.js"));
const errors_js_1 = require("../utils/errors.js");
const getBranding = async (req, res, next) => {
    try {
        const tenantId = req.params.tenantId || req.user?.tenantId;
        if (!tenantId)
            throw new errors_js_1.AppError(400, 'BAD_REQUEST', 'Tenant ID required');
        const branding = await firestoreService.getBrandingDoc(tenantId);
        // ETag handling
        const etag = `W/"${branding.brandingVersion}-${branding.updatedAt}"`;
        if (req.headers['if-none-match'] === etag) {
            return res.status(304).end();
        }
        // Hydrate signed URLs for private assets
        const hydratedAssets = { ...branding.assets };
        for (const [key, asset] of Object.entries(hydratedAssets)) {
            if (asset && asset.path) {
                // Generate a read URL (valid for 1hr)
                asset.signedUrl = await storageService.generateReadUrl(asset.path);
            }
        }
        res.setHeader('ETag', etag);
        res.json({ ...branding, assets: hydratedAssets });
    }
    catch (err) {
        next(err);
    }
};
exports.getBranding = getBranding;
const updateBranding = async (req, res, next) => {
    try {
        const tenantId = req.user.tenantId; // Middleware guarantees this
        const { theme, reportBranding, emailBranding } = req.body;
        const updatedDoc = await firestoreService.updateBrandingDoc(tenantId, req.user.userId, {
            theme,
            reportBranding,
            emailBranding
        });
        res.json(updatedDoc);
    }
    catch (err) {
        next(err);
    }
};
exports.updateBranding = updateBranding;
const listTemplates = async (req, res, next) => {
    try {
        const templates = await firestoreService.getTemplates();
        res.json({ templates });
    }
    catch (err) {
        next(err);
    }
};
exports.listTemplates = listTemplates;
const getTemplate = async (req, res, next) => {
    try {
        const { templateId } = req.params;
        const template = await firestoreService.getTemplateById(templateId);
        if (!template)
            throw new errors_js_1.AppError(404, 'NOT_FOUND', 'Template not found');
        res.json(template);
    }
    catch (err) {
        next(err);
    }
};
exports.getTemplate = getTemplate;
const selectTemplate = async (req, res, next) => {
    try {
        const tenantId = req.user.tenantId;
        const { templateId } = req.body;
        // Verify template exists
        const template = await firestoreService.getTemplateById(templateId);
        if (!template)
            throw new errors_js_1.AppError(400, 'INVALID_TEMPLATE', 'Template does not exist');
        const updatedDoc = await firestoreService.updateBrandingDoc(tenantId, req.user.userId, {
            reportBranding: { templateId } // Partial update handled in service
        });
        res.json(updatedDoc);
    }
    catch (err) {
        next(err);
    }
};
exports.selectTemplate = selectTemplate;
