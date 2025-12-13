import { Request, Response } from 'express';
import { getMediaRecord, listInspectionMedia, setLegalHold } from '../../storage/firestore';
import { generateSignedReadUrl } from '../../storage/gcs';

export const getMedia = async (req: Request, res: Response) => {
  const { mediaId } = req.params;
  const { tenantId } = req.user;

  const media = await getMediaRecord(mediaId, tenantId);
  if (!media) return res.status(404).json({ error: 'Media not found' });

  res.json(media);
};

export const getReadUrls = async (req: Request, res: Response) => {
  const { mediaId } = req.params;
  const { tenantId } = req.user;

  const media = await getMediaRecord(mediaId, tenantId);
  if (!media) return res.status(404).json({ error: 'Media not found' });

  // Generate signed URLs for read access
  const signedUrls = {
    original: await generateSignedReadUrl(media.paths.original),
    thumb_sm: media.paths.thumb_sm ? await generateSignedReadUrl(media.paths.thumb_sm) : null,
    thumb_md: media.paths.thumb_md ? await generateSignedReadUrl(media.paths.thumb_md) : null,
  };

  res.json({
    mediaId,
    urls: signedUrls,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  });
};

export const listMedia = async (req: Request, res: Response) => {
  const { inspectionId } = req.params;
  const { tenantId } = req.user;
  const { roomId, componentId, status } = req.query;

  const results = await listInspectionMedia(tenantId, inspectionId, {
    roomId: roomId as string,
    componentId: componentId as string,
    status: status as string
  });

  res.json({ data: results });
};

export const toggleLegalHold = async (req: Request, res: Response) => {
  const { mediaId } = req.params;
  const { tenantId } = req.user;
  const { isLegalHold } = req.body;

  try {
    await setLegalHold(mediaId, tenantId, !!isLegalHold);
    res.json({ mediaId, isLegalHold: !!isLegalHold });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};