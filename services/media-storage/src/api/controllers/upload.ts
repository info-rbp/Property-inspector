import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateSignedUploadUrl, getStoragePath } from '../../storage/gcs';
import { createMediaRecord, db } from '../../storage/firestore';
import { MediaStatus, InitiateUploadRequest, MediaMetadata } from '../../types';
import { config } from '../../config';
import { PubSub } from '@google-cloud/pubsub';
import { Buffer } from 'buffer';

const pubsub = new PubSub();

// POST /v1/media/initiate-upload
export const initiateUpload = async (req: Request, res: Response) => {
  const body = req.body as InitiateUploadRequest;
  const { tenantId } = req.user;

  // Basic Validation
  if (!body.inspectionId || !body.fileName || !body.contentType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!['image/jpeg', 'image/png'].includes(body.contentType)) {
    return res.status(400).json({ error: 'Invalid content type. Only JPEG/PNG allowed.' });
  }

  const mediaId = uuidv4();
  const fileExt = body.fileName.split('.').pop() || '';
  const storagePath = getStoragePath(tenantId, body.inspectionId, mediaId, 'original', fileExt);

  const metadata: MediaMetadata = {
    mediaId,
    tenantId,
    inspectionId: body.inspectionId,
    roomId: body.roomId,
    componentId: body.componentId,
    status: MediaStatus.PENDING_UPLOAD,
    originalName: body.fileName,
    contentType: body.contentType,
    sizeBytes: body.fileSize,
    uploadedAt: new Date().toISOString(),
    captureTimestamp: body.captureTimestamp,
    labels: body.labels || [],
    paths: { original: storagePath },
    isLegalHold: false,
    expiresAt: new Date(Date.now() + config.RETENTION_DAYS_DEFAULT * 24 * 60 * 60 * 1000).toISOString()
  };

  await createMediaRecord(metadata);

  const signedUrl = await generateSignedUploadUrl(storagePath, body.contentType);

  return res.json({
    mediaId,
    signedUploadUrl: signedUrl,
    expiresAt: new Date(Date.now() + config.UPLOAD_EXPIRY_MINUTES * 60 * 1000).toISOString(),
    requiredHeaders: { 'Content-Type': body.contentType }
  });
};

// POST /v1/media/complete-upload
export const completeUpload = async (req: Request, res: Response) => {
  const { mediaId } = req.body;
  const { tenantId } = req.user;

  if (!mediaId) {
    return res.status(400).json({ error: 'Missing mediaId' });
  }

  try {
    const result = await db.runTransaction(async (t) => {
      const ref = db.collection(config.FIRESTORE_COLLECTION).doc(mediaId);
      const doc = await t.get(ref);

      if (!doc.exists) {
        throw new Error('Media not found');
      }

      const data = doc.data() as MediaMetadata;
      if (data.tenantId !== tenantId) {
        throw new Error('Unauthorized');
      }

      // Idempotency Check
      if (data.status !== MediaStatus.PENDING_UPLOAD) {
        return {
          status: data.status,
          message: 'Upload already confirmed.',
          shouldPublish: false,
          mediaPath: '',
        };
      }

      t.update(ref, { status: MediaStatus.UPLOADED });

      return {
        status: MediaStatus.UPLOADED,
        message: 'Upload confirmed',
        shouldPublish: true,
        mediaPath: data.paths.original,
      };
    });

    if (result.shouldPublish) {
      const dataBuffer = Buffer.from(
        JSON.stringify({
          mediaId,
          tenantId,
          storagePath: result.mediaPath,
        })
      );
      await pubsub.topic(config.PUBSUB_TOPIC).publishMessage({ data: dataBuffer });
    }

    return res.json({ status: result.status, message: result.message });
    
  } catch (error: any) {
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
