import { Storage } from '@google-cloud/storage';
import { config } from '../config';
import { AppError } from '../utils/errors';
import { Buffer } from 'buffer';

const storage = new Storage({ projectId: config.projectId });
const bucket = storage.bucket(config.bucketName);

export class StorageService {
  /**
   * Uploads a PDF buffer to GCS
   */
  async uploadPdf(path: string, buffer: Buffer, metadata: Record<string, string>): Promise<void> {
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
    } catch (err) {
      console.error('Storage upload failed', err);
      throw new AppError('STORAGE_UPLOAD_FAILED', 'Failed to upload report to storage', 500);
    }
  }

  /**
   * Generates a signed URL for reading
   */
  async getSignedUrl(path: string): Promise<string> {
    try {
      const file = bucket.file(path);
      const [exists] = await file.exists();
      
      if (!exists) {
        throw new AppError('FILE_NOT_FOUND', 'Report file not found in storage', 404);
      }

      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + config.signedUrlTtl * 1000,
      });

      return url;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('STORAGE_SIGNING_FAILED', 'Failed to generate download link', 500);
    }
  }
}

export const storageService = new StorageService();