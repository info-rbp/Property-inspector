"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeUpload = exports.initiateUpload = void 0;
const uuid_1 = require("uuid");
const gcs_1 = require("../../storage/gcs");
const firestore_1 = require("../../storage/firestore");
const types_2 = require("../../types");
const config_1 = require("../../config");
const pubsub_1 = require("@google-cloud/pubsub");
const buffer_1 = require("buffer");
const pubsub = new pubsub_1.PubSub();
// POST /v1/media/initiate-upload
const initiateUpload = async (req, res) => {
    const body = req.body;
    const { tenantId } = req.user;
    // Basic Validation
    if (!body.inspectionId || !body.fileName || !body.contentType) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!['image/jpeg', 'image/png'].includes(body.contentType)) {
        return res.status(400).json({ error: 'Invalid content type. Only JPEG/PNG allowed.' });
    }
    const mediaId = (0, uuid_1.v4)();
    const fileExt = body.fileName.split('.').pop() || '';
    const storagePath = (0, gcs_1.getStoragePath)(tenantId, body.inspectionId, mediaId, 'original', fileExt);
    const metadata = {
        mediaId,
        tenantId,
        inspectionId: body.inspectionId,
        roomId: body.roomId,
        componentId: body.componentId,
        status: types_2.MediaStatus.PENDING_UPLOAD,
        originalName: body.fileName,
        contentType: body.contentType,
        sizeBytes: body.fileSize,
        uploadedAt: new Date().toISOString(),
        captureTimestamp: body.captureTimestamp,
        labels: body.labels || [],
        paths: { original: storagePath },
        isLegalHold: false,
        expiresAt: new Date(Date.now() + config_1.config.RETENTION_DAYS_DEFAULT * 24 * 60 * 60 * 1000).toISOString()
    };
    await (0, firestore_1.createMediaRecord)(metadata);
    const signedUrl = await (0, gcs_1.generateSignedUploadUrl)(storagePath, body.contentType);
    return res.json({
        mediaId,
        signedUploadUrl: signedUrl,
        expiresAt: new Date(Date.now() + config_1.config.UPLOAD_EXPIRY_MINUTES * 60 * 1000).toISOString(),
        requiredHeaders: { 'Content-Type': body.contentType }
    });
};
exports.initiateUpload = initiateUpload;
// POST /v1/media/complete-upload
const completeUpload = async (req, res) => {
    const { mediaId } = req.body;
    const { tenantId } = req.user;
    if (!mediaId) {
        return res.status(400).json({ error: 'Missing mediaId' });
    }
    try {
        const result = await firestore_1.db.runTransaction(async (t) => {
            const ref = firestore_1.db.collection(config_1.config.FIRESTORE_COLLECTION).doc(mediaId);
            const doc = await t.get(ref);
            if (!doc.exists) {
                throw new Error('Media not found');
            }
            const data = doc.data();
            if (data.tenantId !== tenantId) {
                throw new Error('Unauthorized');
            }
            // Idempotency Check
            if (data.status !== types_2.MediaStatus.PENDING_UPLOAD) {
                return {
                    status: data.status,
                    message: 'Upload already confirmed.',
                    shouldPublish: false,
                    mediaPath: '',
                };
            }
            t.update(ref, { status: types_2.MediaStatus.UPLOADED });
            return {
                status: types_2.MediaStatus.UPLOADED,
                message: 'Upload confirmed',
                shouldPublish: true,
                mediaPath: data.paths.original,
            };
        });
        if (result.shouldPublish) {
            const dataBuffer = buffer_1.Buffer.from(JSON.stringify({
                mediaId,
                tenantId,
                storagePath: result.mediaPath,
            }));
            await pubsub.topic(config_1.config.PUBSUB_TOPIC).publishMessage({ data: dataBuffer });
        }
        return res.json({ status: result.status, message: result.message });
    }
    catch (error) {
        if (error.message === 'Unauthorized') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        if (error.message === 'Media not found') {
            return res.status(404).json({ error: 'Media not found' });
        }
        console.error('Complete upload failed', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.completeUpload = completeUpload;
