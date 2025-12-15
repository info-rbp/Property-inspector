export declare const generateUploadUrl: (tenantId: string, assetType: string, contentType: string) => Promise<{
    signedUrl: string;
    mediaId: string;
    fullPath: string;
    expiresAt: string;
}>;
export declare const generateReadUrl: (path: string) => Promise<string>;
export declare const deleteAsset: (path: string) => Promise<void>;
