export interface BrandSettings {
    name: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    supportEmail: string;
    websiteUrl: string;
    version: string;
}
export declare class BrandingService {
    getBranding(tenantId: string): Promise<BrandSettings>;
}
