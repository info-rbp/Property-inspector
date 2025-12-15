"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMediaHandler = void 0;
const sharp_1 = __importDefault(require("sharp"));
const gcs_1 = require("../storage/gcs");
const firestore_1 = require("../storage/firestore");
const types_2 = require("../types");
const buffer_1 = require("buffer");
// Helper to generate a single thumbnail
async function generateThumbnail(fileBuffer, mediaId, tenantId, inspectionId, width, quality, suffix) {
    const thumbBuf = await (0, sharp_1.default)(fileBuffer)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer();
    const path = `tenants/${tenantId}/inspections/${inspectionId}/thumbnails/${mediaId}_${suffix}.jpg`;
    await gcs_1.bucket.file(path).save(thumbBuf, {
        contentType: "image/jpeg",
        resumable: false,
        metadata: { cacheControl: "public, max-age=31536000" },
    });
    return path;
}
const processMediaHandler = async (req, res) => {
    try {
        if (!req.body.message)
            return res.status(400).send('Bad Request: No message');
        const dataStr = buffer_1.Buffer.from(req.body.message.data, 'base64').toString();
        const { mediaId, tenantId, storagePath } = JSON.parse(dataStr);
        console.log(`Processing media: ${mediaId} for tenant: ${tenantId}`);
        await (0, firestore_1.updateMediaStatus)(mediaId, types_2.MediaStatus.PROCESSING);
        const mediaDoc = await (0, firestore_1.getMediaRecord)(mediaId, tenantId);
        if (!mediaDoc)
            throw new Error('Media record not found');
        // Download original
        const [fileBuffer] = await gcs_1.bucket.file(storagePath).download();
        // Get Metadata
        const meta = await (0, sharp_1.default)(fileBuffer).metadata();
        // Generate Thumbnails
        const [pathSm, pathMd] = await Promise.all([
            generateThumbnail(fileBuffer, mediaId, tenantId, mediaDoc.inspectionId, 320, 80, 'thumb_sm'),
            generateThumbnail(fileBuffer, mediaId, tenantId, mediaDoc.inspectionId, 1024, 85, 'thumb_md')
        ]);
        // Update DB
        await (0, firestore_1.updateMediaStatus)(mediaId, types_2.MediaStatus.READY, {
            dimensions: { width: meta.width || 0, height: meta.height || 0 },
            processedAt: new Date().toISOString(),
            paths: {
                ...mediaDoc.paths,
                thumb_sm: pathSm,
                thumb_md: pathMd
            }
        });
        console.log(`Successfully processed ${mediaId}`);
        return res.status(200).send('OK');
    }
    catch (error) {
        console.error('Processing failed', error);
        // Note: Pub/Sub will retry on non-200 status. 
        // If error is permanent (e.g. invalid image), we should catch and set status=FAILED to avoid infinite loop.
        return res.status(500).send('Internal Server Error');
    }
};
exports.processMediaHandler = processMediaHandler;
