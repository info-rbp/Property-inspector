
import { storage } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = process.env.EVIDENCE_BUCKET_NAME;

export class StorageService {
  /**
   * Uploads a JSON payload to GCS and returns the URI.
   */
  static async uploadPayload(tenantId: string, payload: any): Promise<string> {
    if (!BUCKET_NAME) throw new Error("EVIDENCE_BUCKET_NAME not configured");

    const filename = `audit/${tenantId}/${new Date().toISOString().split('T')[0]}/${uuidv4()}.json`;
    const bucket = storage.bucket(BUCKET_NAME);
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
  static async getSignedUrl(gcsUri: string): Promise<string> {
    if (!BUCKET_NAME) throw new Error("EVIDENCE_BUCKET_NAME not configured");
    
    // Extract path from gs://bucket/path
    const path = gcsUri.replace(`gs://${BUCKET_NAME}/`, '');
    const file = storage.bucket(BUCKET_NAME).file(path);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    return url;
  }
}
