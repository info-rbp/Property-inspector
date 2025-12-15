"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleLegalHold = exports.listMedia = exports.getReadUrls = exports.getMedia = void 0;
const firestore_1 = require("../../storage/firestore");
const gcs_1 = require("../../storage/gcs");
const getMedia = async (req, res) => {
    const { mediaId } = req.params;
    const { tenantId } = req.user;
    const media = await (0, firestore_1.getMediaRecord)(mediaId, tenantId);
    if (!media)
        return res.status(404).json({ error: 'Media not found' });
    return res.json(media);
};
exports.getMedia = getMedia;
const getReadUrls = async (req, res) => {
    const { mediaId } = req.params;
    const { tenantId } = req.user;
    const media = await (0, firestore_1.getMediaRecord)(mediaId, tenantId);
    if (!media)
        return res.status(404).json({ error: 'Media not found' });
    // Generate signed URLs for read access
    const signedUrls = {
        original: await (0, gcs_1.generateSignedReadUrl)(media.paths.original),
        thumb_sm: media.paths.thumb_sm ? await (0, gcs_1.generateSignedReadUrl)(media.paths.thumb_sm) : null,
        thumb_md: media.paths.thumb_md ? await (0, gcs_1.generateSignedReadUrl)(media.paths.thumb_md) : null,
    };
    return res.json({
        mediaId,
        urls: signedUrls,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });
};
exports.getReadUrls = getReadUrls;
const listMedia = async (req, res) => {
    const { inspectionId } = req.params;
    const { tenantId } = req.user;
    const { roomId, componentId, status } = req.query;
    const results = await (0, firestore_1.listInspectionMedia)(tenantId, inspectionId, {
        roomId: roomId,
        componentId: componentId,
        status: status
    });
    return res.json({ data: results });
};
exports.listMedia = listMedia;
const toggleLegalHold = async (req, res) => {
    const { mediaId } = req.params;
    const { tenantId } = req.user;
    const { isLegalHold } = req.body;
    try {
        await (0, firestore_1.setLegalHold)(mediaId, tenantId, !!isLegalHold);
        return res.json({ mediaId, isLegalHold: !!isLegalHold });
    }
    catch (e) {
        return res.status(500).json({ error: e.message });
    }
};
exports.toggleLegalHold = toggleLegalHold;
