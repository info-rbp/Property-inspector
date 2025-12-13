import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, z } from 'zod';
import { AppError } from '../utils/errors.js';
import { config } from '../config.js';

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new AppError(400, 'VALIDATION_ERROR', error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')));
        } else {
            next(error);
        }
    }
};

// --- Reusable Validators ---

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color #RRGGBB");

export const updateBrandingSchema = z.object({
    body: z.object({
        theme: z.object({
            primaryColor: hexColor.optional(),
            secondaryColor: hexColor.optional(),
            accentColor: hexColor.optional(),
            backgroundColor: hexColor.optional(),
            surfaceColor: hexColor.optional(),
            textColor: hexColor.optional(),
            mutedTextColor: hexColor.optional(),
            borderRadius: z.number().optional(),
            fontFamily: z.enum(config.ALLOWED_FONTS as [string, ...string[]]).optional(),
            logoPlacement: z.enum(['left', 'center']).optional(),
            showPoweredBy: z.boolean().optional(),
        }).partial().optional(),
        reportBranding: z.object({
            headerStyle: z.enum(['none', 'logoLeft', 'centeredTitle', 'letterhead']).optional(),
            footerText: z.string().optional(),
            includeAgentDetails: z.boolean().optional(),
            coverPageEnabled: z.boolean().optional(),
            watermarkEnabled: z.boolean().optional(),
            signatureBlockEnabled: z.boolean().optional(),
            dateFormat: z.string().optional(),
            pageNumbering: z.boolean().optional(),
        }).partial().optional(),
        emailBranding: z.object({
            fromName: z.string().optional(),
            replyTo: z.string().email().optional(),
            brandColor: hexColor.optional(),
        }).partial().optional(),
    })
});

export const initiateUploadSchema = z.object({
    body: z.object({
        assetType: z.enum(['logo', 'logoDark', 'favicon', 'letterhead', 'watermark']),
        fileName: z.string().min(1),
        contentType: z.string(),
        fileSize: z.number().max(config.MAX_ASSET_SIZE_BYTES),
    })
});

export const completeUploadSchema = z.object({
    body: z.object({
        mediaId: z.string().uuid(),
        assetType: z.enum(['logo', 'logoDark', 'favicon', 'letterhead', 'watermark']),
    })
});

export const selectTemplateSchema = z.object({
    body: z.object({
        templateId: z.string().min(1)
    })
});