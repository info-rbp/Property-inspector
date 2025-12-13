import { Request, Response, NextFunction } from 'express';
import * as firestoreService from '../services/firestore.js';
import * as storageService from '../services/storage.js';
import { AppError } from '../utils/errors.js';

export const getBranding = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.params.tenantId || req.user?.tenantId;
        if (!tenantId) throw new AppError(400, 'BAD_REQUEST', 'Tenant ID required');

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
    } catch (err) {
        next(err);
    }
};

export const updateBranding = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.user!.tenantId; // Middleware guarantees this
        const { theme, reportBranding, emailBranding } = req.body;

        const updatedDoc = await firestoreService.updateBrandingDoc(tenantId, req.user!.userId, {
            theme,
            reportBranding,
            emailBranding
        });

        res.json(updatedDoc);
    } catch (err) {
        next(err);
    }
};

export const listTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const templates = await firestoreService.getTemplates();
        res.json({ templates });
    } catch (err) {
        next(err);
    }
};

export const getTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { templateId } = req.params;
        const template = await firestoreService.getTemplateById(templateId);
        if (!template) throw new AppError(404, 'NOT_FOUND', 'Template not found');
        res.json(template);
    } catch (err) {
        next(err);
    }
};

export const selectTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.user!.tenantId;
        const { templateId } = req.body;

        // Verify template exists
        const template = await firestoreService.getTemplateById(templateId);
        if (!template) throw new AppError(400, 'INVALID_TEMPLATE', 'Template does not exist');

        const updatedDoc = await firestoreService.updateBrandingDoc(tenantId, req.user!.userId, {
            reportBranding: { templateId } as any // Partial update handled in service
        });

        res.json(updatedDoc);
    } catch (err) {
        next(err);
    }
};