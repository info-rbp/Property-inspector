"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAsset = exports.generateReadUrl = exports.generateUploadUrl = void 0;
const storage_1 = require("@google-cloud/storage");
const uuid_1 = require("uuid");
const config_js_1 = require("../config.js");
const storage = new storage_1.Storage({ projectId: config_js_1.config.GCP_PROJECT_ID });
const bucket = storage.bucket(config_js_1.config.BRANDING_BUCKET_NAME);
/**
 * Generates a path: tenants/{tenantId}/branding/{assetType}/{mediaId}.{ext}
 */
const getStoragePath = (tenantId, assetType, mediaId, extension) => {
    return `tenants/${tenantId}/branding/${assetType}/${mediaId}.${extension}`;
};
const generateUploadUrl = async (tenantId, assetType, contentType) => {
    const ext = contentType.split('/')[1] || 'bin';
    const mediaId = (0, uuid_1.v4)();
    const fullPath = getStoragePath(tenantId, assetType, mediaId, ext);
    const file = bucket.file(fullPath);
    const expiresAt = new Date(Date.now() + config_js_1.config.SIGNED_URL_TTL_SECONDS * 1000);
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
exports.generateUploadUrl = generateUploadUrl;
const generateReadUrl = async (path) => {
    if (!path)
        return '';
    // If it's a public path or absolute URL, return as is
    if (path.startsWith('http'))
        return path;
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
    try {
        const [url] = await bucket.file(path).getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: expiresAt,
        });
        return url;
    }
    catch (error) {
        console.error(`Failed to generate read URL for ${path}`, error);
        return '';
    }
};
exports.generateReadUrl = generateReadUrl;
const deleteAsset = async (path) => {
    try {
        await bucket.file(path).delete();
    }
    catch (e) {
        console.warn(`Failed to delete asset ${path}`, e);
        // Don't throw, assume it might be already gone
    }
};
exports.deleteAsset = deleteAsset;
