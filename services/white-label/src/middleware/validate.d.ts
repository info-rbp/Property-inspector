import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, z } from 'zod';
export declare const validate: (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => void;
export declare const updateBrandingSchema: z.ZodObject<{
    body: z.ZodObject<{
        theme: z.ZodOptional<z.ZodObject<{
            primaryColor: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            secondaryColor: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            accentColor: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            backgroundColor: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            surfaceColor: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            textColor: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            mutedTextColor: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            borderRadius: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            fontFamily: z.ZodOptional<z.ZodOptional<z.ZodEnum<[string, ...string[]]>>>;
            logoPlacement: z.ZodOptional<z.ZodOptional<z.ZodEnum<["left", "center"]>>>;
            showPoweredBy: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            fontFamily?: string | undefined;
            borderRadius?: number | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            accentColor?: string | undefined;
            backgroundColor?: string | undefined;
            surfaceColor?: string | undefined;
            textColor?: string | undefined;
            mutedTextColor?: string | undefined;
            logoPlacement?: "center" | "left" | undefined;
            showPoweredBy?: boolean | undefined;
        }, {
            fontFamily?: string | undefined;
            borderRadius?: number | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            accentColor?: string | undefined;
            backgroundColor?: string | undefined;
            surfaceColor?: string | undefined;
            textColor?: string | undefined;
            mutedTextColor?: string | undefined;
            logoPlacement?: "center" | "left" | undefined;
            showPoweredBy?: boolean | undefined;
        }>>;
        reportBranding: z.ZodOptional<z.ZodObject<{
            headerStyle: z.ZodOptional<z.ZodOptional<z.ZodEnum<["none", "logoLeft", "centeredTitle", "letterhead"]>>>;
            footerText: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            includeAgentDetails: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
            coverPageEnabled: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
            watermarkEnabled: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
            signatureBlockEnabled: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
            dateFormat: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            pageNumbering: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            footerText?: string | undefined;
            headerStyle?: "none" | "logoLeft" | "centeredTitle" | "letterhead" | undefined;
            includeAgentDetails?: boolean | undefined;
            coverPageEnabled?: boolean | undefined;
            watermarkEnabled?: boolean | undefined;
            signatureBlockEnabled?: boolean | undefined;
            dateFormat?: string | undefined;
            pageNumbering?: boolean | undefined;
        }, {
            footerText?: string | undefined;
            headerStyle?: "none" | "logoLeft" | "centeredTitle" | "letterhead" | undefined;
            includeAgentDetails?: boolean | undefined;
            coverPageEnabled?: boolean | undefined;
            watermarkEnabled?: boolean | undefined;
            signatureBlockEnabled?: boolean | undefined;
            dateFormat?: string | undefined;
            pageNumbering?: boolean | undefined;
        }>>;
        emailBranding: z.ZodOptional<z.ZodObject<{
            fromName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            replyTo: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            brandColor: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            replyTo?: string | undefined;
            fromName?: string | undefined;
            brandColor?: string | undefined;
        }, {
            replyTo?: string | undefined;
            fromName?: string | undefined;
            brandColor?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        theme?: {
            fontFamily?: string | undefined;
            borderRadius?: number | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            accentColor?: string | undefined;
            backgroundColor?: string | undefined;
            surfaceColor?: string | undefined;
            textColor?: string | undefined;
            mutedTextColor?: string | undefined;
            logoPlacement?: "center" | "left" | undefined;
            showPoweredBy?: boolean | undefined;
        } | undefined;
        reportBranding?: {
            footerText?: string | undefined;
            headerStyle?: "none" | "logoLeft" | "centeredTitle" | "letterhead" | undefined;
            includeAgentDetails?: boolean | undefined;
            coverPageEnabled?: boolean | undefined;
            watermarkEnabled?: boolean | undefined;
            signatureBlockEnabled?: boolean | undefined;
            dateFormat?: string | undefined;
            pageNumbering?: boolean | undefined;
        } | undefined;
        emailBranding?: {
            replyTo?: string | undefined;
            fromName?: string | undefined;
            brandColor?: string | undefined;
        } | undefined;
    }, {
        theme?: {
            fontFamily?: string | undefined;
            borderRadius?: number | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            accentColor?: string | undefined;
            backgroundColor?: string | undefined;
            surfaceColor?: string | undefined;
            textColor?: string | undefined;
            mutedTextColor?: string | undefined;
            logoPlacement?: "center" | "left" | undefined;
            showPoweredBy?: boolean | undefined;
        } | undefined;
        reportBranding?: {
            footerText?: string | undefined;
            headerStyle?: "none" | "logoLeft" | "centeredTitle" | "letterhead" | undefined;
            includeAgentDetails?: boolean | undefined;
            coverPageEnabled?: boolean | undefined;
            watermarkEnabled?: boolean | undefined;
            signatureBlockEnabled?: boolean | undefined;
            dateFormat?: string | undefined;
            pageNumbering?: boolean | undefined;
        } | undefined;
        emailBranding?: {
            replyTo?: string | undefined;
            fromName?: string | undefined;
            brandColor?: string | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        theme?: {
            fontFamily?: string | undefined;
            borderRadius?: number | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            accentColor?: string | undefined;
            backgroundColor?: string | undefined;
            surfaceColor?: string | undefined;
            textColor?: string | undefined;
            mutedTextColor?: string | undefined;
            logoPlacement?: "center" | "left" | undefined;
            showPoweredBy?: boolean | undefined;
        } | undefined;
        reportBranding?: {
            footerText?: string | undefined;
            headerStyle?: "none" | "logoLeft" | "centeredTitle" | "letterhead" | undefined;
            includeAgentDetails?: boolean | undefined;
            coverPageEnabled?: boolean | undefined;
            watermarkEnabled?: boolean | undefined;
            signatureBlockEnabled?: boolean | undefined;
            dateFormat?: string | undefined;
            pageNumbering?: boolean | undefined;
        } | undefined;
        emailBranding?: {
            replyTo?: string | undefined;
            fromName?: string | undefined;
            brandColor?: string | undefined;
        } | undefined;
    };
}, {
    body: {
        theme?: {
            fontFamily?: string | undefined;
            borderRadius?: number | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            accentColor?: string | undefined;
            backgroundColor?: string | undefined;
            surfaceColor?: string | undefined;
            textColor?: string | undefined;
            mutedTextColor?: string | undefined;
            logoPlacement?: "center" | "left" | undefined;
            showPoweredBy?: boolean | undefined;
        } | undefined;
        reportBranding?: {
            footerText?: string | undefined;
            headerStyle?: "none" | "logoLeft" | "centeredTitle" | "letterhead" | undefined;
            includeAgentDetails?: boolean | undefined;
            coverPageEnabled?: boolean | undefined;
            watermarkEnabled?: boolean | undefined;
            signatureBlockEnabled?: boolean | undefined;
            dateFormat?: string | undefined;
            pageNumbering?: boolean | undefined;
        } | undefined;
        emailBranding?: {
            replyTo?: string | undefined;
            fromName?: string | undefined;
            brandColor?: string | undefined;
        } | undefined;
    };
}>;
export declare const initiateUploadSchema: z.ZodObject<{
    body: z.ZodObject<{
        assetType: z.ZodEnum<["logo", "logoDark", "favicon", "letterhead", "watermark"]>;
        fileName: z.ZodString;
        contentType: z.ZodString;
        fileSize: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        fileName: string;
        fileSize: number;
        contentType: string;
        assetType: "letterhead" | "logo" | "logoDark" | "favicon" | "watermark";
    }, {
        fileName: string;
        fileSize: number;
        contentType: string;
        assetType: "letterhead" | "logo" | "logoDark" | "favicon" | "watermark";
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        fileName: string;
        fileSize: number;
        contentType: string;
        assetType: "letterhead" | "logo" | "logoDark" | "favicon" | "watermark";
    };
}, {
    body: {
        fileName: string;
        fileSize: number;
        contentType: string;
        assetType: "letterhead" | "logo" | "logoDark" | "favicon" | "watermark";
    };
}>;
export declare const completeUploadSchema: z.ZodObject<{
    body: z.ZodObject<{
        mediaId: z.ZodString;
        assetType: z.ZodEnum<["logo", "logoDark", "favicon", "letterhead", "watermark"]>;
    }, "strip", z.ZodTypeAny, {
        mediaId: string;
        assetType: "letterhead" | "logo" | "logoDark" | "favicon" | "watermark";
    }, {
        mediaId: string;
        assetType: "letterhead" | "logo" | "logoDark" | "favicon" | "watermark";
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        mediaId: string;
        assetType: "letterhead" | "logo" | "logoDark" | "favicon" | "watermark";
    };
}, {
    body: {
        mediaId: string;
        assetType: "letterhead" | "logo" | "logoDark" | "favicon" | "watermark";
    };
}>;
export declare const selectTemplateSchema: z.ZodObject<{
    body: z.ZodObject<{
        templateId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        templateId: string;
    }, {
        templateId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        templateId: string;
    };
}, {
    body: {
        templateId: string;
    };
}>;
