import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import { AppError } from '../utils/errors.js';

const storage = new Storage({ projectId: config.GCP_PROJECT_ID });
const bucket = storage.bucket(config.BRANDING_BUCKET_NAME);

/**
 * Generates a path: tenants/{tenantId}/branding/{assetType}/{mediaId}.{ext}
 */
const getStoragePath = (tenantId: string, assetType: string, mediaId: string, extension: string) => {
    return `tenants/${tenantId}/branding/${assetType}/${mediaId}.${extension}`;
};

export const generateUploadUrl = async (
    tenantId: string,
    assetType: string,
    contentType: string
): Promise<{ signedUrl: string; mediaId: string; fullPath: string; expiresAt: string }> => {
    const ext = contentType.split('/')[1] || 'bin';
    const mediaId = uuidv4();
    const fullPath = getStoragePath(tenantId, assetType, mediaId, ext);
    const file = bucket.file(fullPath);

    const expiresAt = new Date(Date.now() + config.SIGNED_URL_TTL_SECONDS * 1000);

    const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: expiresAt,
        contentType,
        extensionHeaders: {
             // Enforce size limit via headers if using Resumable uploads, 
             // but for V4 signed PUT, we rely on validation before issue.
             // Cloud Storage doesn't strictly enforce size in signed URL V4 without policy documents.
             // We rely on client strictness + post-processing checks if needed.
        }
    });

    return { signedUrl, mediaId, fullPath, expiresAt: expiresAt.toISOString() };
};

export const generateReadUrl = async (path: string): Promise<string> => {
    if (!path) return '';
    
    // If it's a public path or absolute URL, return as is
    if (path.startsWith('http')) return path;

    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    try {
        const [url] = await bucket.file(path).getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: expiresAt,
        });
        return url;
    } catch (error) {
        console.error(`Failed to generate read URL for ${path}`, error);
        return '';
    }
};

export const deleteAsset = async (path: string) => {
    try {
        await bucket.file(path).delete();
    } catch (e) {
        console.warn(`Failed to delete asset ${path}`, e);
        // Don't throw, assume it might be already gone
    }
};