"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectTemplateSchema = exports.completeUploadSchema = exports.initiateUploadSchema = exports.updateBrandingSchema = exports.validate = void 0;
const zod_1 = require("zod");
const errors_js_1 = require("../utils/errors.js");
const config_js_1 = require("../config.js");
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            next(new errors_js_1.AppError(400, 'VALIDATION_ERROR', error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')));
        }
        else {
            next(error);
        }
    }
};
exports.validate = validate;
// --- Reusable Validators ---
const hexColor = zod_1.z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color #RRGGBB");
exports.updateBrandingSchema = zod_1.z.object({
    body: zod_1.z.object({
        theme: zod_1.z.object({
            primaryColor: hexColor.optional(),
            secondaryColor: hexColor.optional(),
            accentColor: hexColor.optional(),
            backgroundColor: hexColor.optional(),
            surfaceColor: hexColor.optional(),
            textColor: hexColor.optional(),
            mutedTextColor: hexColor.optional(),
            borderRadius: zod_1.z.number().optional(),
            fontFamily: zod_1.z.enum(config_js_1.config.ALLOWED_FONTS).optional(),
            logoPlacement: zod_1.z.enum(['left', 'center']).optional(),
            showPoweredBy: zod_1.z.boolean().optional(),
        }).partial().optional(),
        reportBranding: zod_1.z.object({
            headerStyle: zod_1.z.enum(['none', 'logoLeft', 'centeredTitle', 'letterhead']).optional(),
            footerText: zod_1.z.string().optional(),
            includeAgentDetails: zod_1.z.boolean().optional(),
            coverPageEnabled: zod_1.z.boolean().optional(),
            watermarkEnabled: zod_1.z.boolean().optional(),
            signatureBlockEnabled: zod_1.z.boolean().optional(),
            dateFormat: zod_1.z.string().optional(),
            pageNumbering: zod_1.z.boolean().optional(),
        }).partial().optional(),
        emailBranding: zod_1.z.object({
            fromName: zod_1.z.string().optional(),
            replyTo: zod_1.z.string().email().optional(),
            brandColor: hexColor.optional(),
        }).partial().optional(),
    })
});
exports.initiateUploadSchema = zod_1.z.object({
    body: zod_1.z.object({
        assetType: zod_1.z.enum(['logo', 'logoDark', 'favicon', 'letterhead', 'watermark']),
        fileName: zod_1.z.string().min(1),
        contentType: zod_1.z.string(),
        fileSize: zod_1.z.number().max(config_js_1.config.MAX_ASSET_SIZE_BYTES),
    })
});
exports.completeUploadSchema = zod_1.z.object({
    body: zod_1.z.object({
        mediaId: zod_1.z.string().uuid(),
        assetType: zod_1.z.enum(['logo', 'logoDark', 'favicon', 'letterhead', 'watermark']),
    })
});
exports.selectTemplateSchema = zod_1.z.object({
    body: zod_1.z.object({
        templateId: zod_1.z.string().min(1)
    })
});
