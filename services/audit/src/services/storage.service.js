"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const firebase_1 = require("../config/firebase");
const uuid_1 = require("uuid");
const BUCKET_NAME = process.env.EVIDENCE_BUCKET_NAME;
class StorageService {
    /**
     * Uploads a JSON payload to GCS and returns the URI.
     */
    static async uploadPayload(tenantId, payload) {
        if (!BUCKET_NAME)
            throw new Error("EVIDENCE_BUCKET_NAME not configured");
        const filename = `audit/${tenantId}/${new Date().toISOString().split('T')[0]}/${(0, uuid_1.v4)()}.json`;
        const bucket = firebase_1.storage.bucket(BUCKET_NAME);
        const file = bucket.file(filename);
        await file.save(JSON.stringify(payload), {
            contentType: 'application/json',
            metadata: {
                immutable: 'true',
                tenantId
            }
        });
        return `gs://${BUCKET_NAME}/${filename}`;
    }
    /**
     * Generates a signed URL for reading large payloads.
     */
    static async getSignedUrl(gcsUri) {
        if (!BUCKET_NAME)
            throw new Error("EVIDENCE_BUCKET_NAME not configured");
        // Extract path from gs://bucket/path
        const path = gcsUri.replace(`gs://${BUCKET_NAME}/`, '');
        const file = firebase_1.storage.bucket(BUCKET_NAME).file(path);
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        });
        return url;
    }
}
exports.StorageService = StorageService;
