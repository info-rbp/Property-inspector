"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBuffer = exports.downloadFileToBuffer = exports.deleteFile = exports.generateSignedReadUrl = exports.generateSignedUploadUrl = exports.getStoragePath = exports.bucket = exports.storage = void 0;
const storage_1 = require("@google-cloud/storage");
const config_1 = require("../config");
exports.storage = new storage_1.Storage();
exports.bucket = exports.storage.bucket(config_1.config.GCS_BUCKET_NAME);
const getStoragePath = (tenantId, inspectionId, mediaId, type, ext = '') => {
    const folder = type === 'original' ? '' : 'thumbnails/';
    const suffix = type === 'original' ? '' : `_${type}`;
    // Ensure extension has dot if provided
    const extension = ext && !ext.startsWith('.') ? `.${ext}` : ext;
    return `tenants/${tenantId}/inspections/${inspectionId}/${folder}${mediaId}${suffix}${extension}`;
};
exports.getStoragePath = getStoragePath;
const generateSignedUploadUrl = async (storagePath, contentType) => {
    const [url] = await exports.bucket.file(storagePath).getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + config_1.config.UPLOAD_EXPIRY_MINUTES * 60 * 1000,
        contentType,
    });
    return url;
};
exports.generateSignedUploadUrl = generateSignedUploadUrl;
const generateSignedReadUrl = async (storagePath) => {
    if (!storagePath)
        return '';
    const [url] = await exports.bucket.file(storagePath).getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + config_1.config.READ_EXPIRY_MINUTES * 60 * 1000,
    });
    return url;
};
exports.generateSignedReadUrl = generateSignedReadUrl;
const deleteFile = async (storagePath) => {
    if (!storagePath)
        return;
    try {
        await exports.bucket.file(storagePath).delete();
    }
    catch (e) {
        if (e.code !== 404)
            throw e;
    }
};
exports.deleteFile = deleteFile;
const downloadFileToBuffer = async (storagePath) => {
    const [buffer] = await exports.bucket.file(storagePath).download();
    return buffer;
};
exports.downloadFileToBuffer = downloadFileToBuffer;
const uploadBuffer = async (storagePath, buffer, contentType) => {
    await exports.bucket.file(storagePath).save(buffer, {
        contentType,
        resumable: false
    });
};
exports.uploadBuffer = uploadBuffer;
