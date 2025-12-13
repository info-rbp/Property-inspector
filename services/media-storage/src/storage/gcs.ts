import { Storage } from '@google-cloud/storage';
import { config } from '../config';
import { Buffer } from 'buffer';

export const storage = new Storage();
export const bucket = storage.bucket(config.GCS_BUCKET_NAME);

export const getStoragePath = (tenantId: string, inspectionId: string, mediaId: string, type: 'original' | 'thumb_sm' | 'thumb_md', ext: string = '') => {
  const folder = type === 'original' ? '' : 'thumbnails/';
  const suffix = type === 'original' ? '' : `_${type}`;
  // Ensure extension has dot if provided
  const extension = ext && !ext.startsWith('.') ? `.${ext}` : ext;
  return `tenants/${tenantId}/inspections/${inspectionId}/${folder}${mediaId}${suffix}${extension}`;
};

export const generateSignedUploadUrl = async (
  storagePath: string, 
  contentType: string
): Promise<string> => {
  const [url] = await bucket.file(storagePath).getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + config.UPLOAD_EXPIRY_MINUTES * 60 * 1000,
    contentType,
  });
  return url;
};

export const generateSignedReadUrl = async (storagePath: string): Promise<string> => {
  if (!storagePath) return '';
  const [url] = await bucket.file(storagePath).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + config.READ_EXPIRY_MINUTES * 60 * 1000,
  });
  return url;
};

export const deleteFile = async (storagePath: string) => {
  if (!storagePath) return;
  try {
    await bucket.file(storagePath).delete();
  } catch (e: any) {
    if (e.code !== 404) throw e; 
  }
};

export const downloadFileToBuffer = async (storagePath: string): Promise<Buffer> => {
  const [buffer] = await bucket.file(storagePath).download();
  return buffer;
};

export const uploadBuffer = async (storagePath: string, buffer: Buffer, contentType: string) => {
  await bucket.file(storagePath).save(buffer, {
    contentType,
    resumable: false
  });
};