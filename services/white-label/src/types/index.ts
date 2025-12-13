// --- Auth Types ---
export interface AuthUser {
    userId: string;
    tenantId: string;
    role: 'platform_admin' | 'tenant_admin' | 'inspector' | 'viewer';
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

// --- Domain Models ---

export enum FontFamily {
    SYSTEM = 'system',
    INTER = 'inter',
    ROBOTO = 'roboto',
    LATO = 'lato',
    OPEN_SANS = 'open_sans'
}

export interface BrandingTheme {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    mutedTextColor: string;
    borderRadius: number;
    fontFamily: string;
    logoPlacement: 'left' | 'center';
    showPoweredBy: boolean;
}

export interface AssetRef {
    mediaId: string;
    path: string;
    width?: number;
    height?: number;
    contentType: string;
    signedUrl?: string; // Hydrated on response
}

export interface BrandingAssets {
    logo?: AssetRef;
    logoDark?: AssetRef;
    favicon?: AssetRef;
    letterhead?: AssetRef;
    watermark?: AssetRef;
}

export interface ReportBranding {
    templateId: string;
    headerStyle: 'none' | 'logoLeft' | 'centeredTitle' | 'letterhead';
    footerText?: string;
    includeAgentDetails: boolean;
    includeCompanyRegistration?: string;
    coverPageEnabled: boolean;
    watermarkEnabled: boolean;
    signatureBlockEnabled: boolean;
    disclaimerText?: string;
    dateFormat: string;
    pageNumbering: boolean;
}

export interface EmailBranding {
    fromName: string;
    replyTo: string;
    brandColor: string;
    logoMediaId?: string;
}

export interface DomainMapping {
    primaryDomain?: string;
    customDomains: Array<{
        domain: string;
        status: 'pending' | 'active' | 'error';
        createdAt: number;
    }>;
}

export interface BrandingDocument {
    tenantId: string;
    brandingVersion: number;
    updatedAt: number; // Unix timestamp
    updatedByUserId: string;
    status: 'active' | 'disabled';
    theme: BrandingTheme;
    assets: BrandingAssets;
    reportBranding: ReportBranding;
    emailBranding: EmailBranding;
    domains?: DomainMapping;
}

// --- API Request/Response Types ---

export interface InitiateUploadRequest {
    assetType: keyof BrandingAssets;
    fileName: string;
    contentType: string;
    fileSize: number;
}

export interface InitiateUploadResponse {
    mediaId: string;
    signedUploadUrl: string;
    requiredHeaders: Record<string, string>;
    expiresAt: string;
}

export interface CompleteUploadRequest {
    mediaId: string;
    assetType: keyof BrandingAssets;
}

export interface Template {
    templateId: string;
    name: string;
    description: string;
    supportedInspectionTypes: string[];
    schemaVersion: string;
    previewImageAssetPath?: string;
    defaultThemeOverrides?: Partial<BrandingTheme>;
}