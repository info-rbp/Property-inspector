"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.StorageService = void 0;
const storage_1 = require("@google-cloud/storage");
const config_1 = require("../config");
const errors_1 = require("../utils/errors");
const storage = new storage_1.Storage({ projectId: config_1.config.projectId });
const bucket = storage.bucket(config_1.config.bucketName);
class StorageService {
    /**
     * Uploads a PDF buffer to GCS
     */
    async uploadPdf(path, buffer, metadata) {
        try {
            const file = bucket.file(path);
            await file.save(buffer, {
                contentType: 'application/pdf',
                metadata: {
                    ...metadata,
                    generatedBy: 'report-generation-service',
                },
                resumable: false,
            });
        }
        catch (err) {
            console.error('Storage upload failed', err);
            throw new errors_1.AppError('STORAGE_UPLOAD_FAILED', 'Failed to upload report to storage', 500);
        }
    }
    /**
     * Generates a signed URL for reading
     */
    async getSignedUrl(path) {
        try {
            const file = bucket.file(path);
            const [exists] = await file.exists();
            if (!exists) {
                throw new errors_1.AppError('FILE_NOT_FOUND', 'Report file not found in storage', 404);
            }
            const [url] = await file.getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + config_1.config.signedUrlTtl * 1000,
            });
            return url;
        }
        catch (err) {
            if (err instanceof errors_1.AppError)
                throw err;
            throw new errors_1.AppError('STORAGE_SIGNING_FAILED', 'Failed to generate download link', 500);
        }
    }
}
exports.StorageService = StorageService;
exports.storageService = new StorageService();
