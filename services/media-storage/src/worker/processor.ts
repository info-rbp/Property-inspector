import { Request, Response } from 'express';
import sharp from 'sharp';
import { bucket } from '../storage/gcs';
import { updateMediaStatus, getMediaRecord } from '../storage/firestore';
import { MediaStatus } from '../types';
import { Buffer } from 'buffer';

export type ProcessResult = {
  thumbnailPath: string;
  width?: number;
  height?: number;
};

// Helper to generate a single thumbnail
async function generateThumbnail(
  fileBuffer: Buffer,
  mediaId: string,
  tenantId: string,
  inspectionId: string,
  width: number,
  quality: number,
  suffix: string
): Promise<string> {
  const thumbBuf = await sharp(fileBuffer)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();

  const path = `tenants/${tenantId}/inspections/${inspectionId}/thumbnails/${mediaId}_${suffix}.jpg`;
  
  await bucket.file(path).save(thumbBuf, {
    contentType: "image/jpeg",
    resumable: false,
    metadata: { cacheControl: "public, max-age=31536000" },
  });

  return path;
}

export const processMediaHandler = async (req: Request, res: Response) => {
  try {
    if (!req.body.message) return res.status(400).send('Bad Request: No message');

    const dataStr = Buffer.from(req.body.message.data, 'base64').toString();
    const { mediaId, tenantId, storagePath } = JSON.parse(dataStr);

    console.log(`Processing media: ${mediaId} for tenant: ${tenantId}`);
    
    await updateMediaStatus(mediaId, MediaStatus.PROCESSING);

    const mediaDoc = await getMediaRecord(mediaId, tenantId);
    if (!mediaDoc) throw new Error('Media record not found');

    // Download original
    const [fileBuffer] = await bucket.file(storagePath).download();

    // Get Metadata
    const meta = await sharp(fileBuffer).metadata();
    
    // Generate Thumbnails
    const [pathSm, pathMd] = await Promise.all([
      generateThumbnail(fileBuffer, mediaId, tenantId, mediaDoc.inspectionId, 320, 80, 'thumb_sm'),
      generateThumbnail(fileBuffer, mediaId, tenantId, mediaDoc.inspectionId, 1024, 85, 'thumb_md')
    ]);

    // Update DB
    await updateMediaStatus(mediaId, MediaStatus.READY, {
      dimensions: { width: meta.width || 0, height: meta.height || 0 },
      processedAt: new Date().toISOString(),
      paths: {
        ...mediaDoc.paths,
        thumb_sm: pathSm,
        thumb_md: pathMd
      }
    });

    console.log(`Successfully processed ${mediaId}`);
    res.status(200).send('OK');

  } catch (error) {
    console.error('Processing failed', error);
    // Note: Pub/Sub will retry on non-200 status. 
    // If error is permanent (e.g. invalid image), we should catch and set status=FAILED to avoid infinite loop.
    res.status(500).send('Internal Server Error');
  }
};