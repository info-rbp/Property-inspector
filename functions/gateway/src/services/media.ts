import { BaseClient } from './base';
import { env } from '../config/env';

class MediaService extends BaseClient {
  constructor() {
    super('Media', env.MEDIA_SERVICE_URL);
  }

  async initiateUpload(tenantId: string, payload: { filename: string, contentType: string, sizeBytes: number }) {
    try {
      const { data } = await this.client.post('/v1/uploads/initiate', payload, {
        headers: { 'X-Tenant-ID': tenantId }
      });
      return data as { mediaId: string; uploadUrl: string; expiresAt: string };
    } catch (e) {
      this.handleError(e, 'initiateUpload');
    }
  }

  async completeUpload(tenantId: string, mediaId: string) {
    try {
      const { data } = await this.client.post(`/v1/uploads/${mediaId}/complete`, {}, {
        headers: { 'X-Tenant-ID': tenantId }
      });
      return data as { status: string; url: string; checksum: string };
    } catch (e) {
      this.handleError(e, 'completeUpload');
    }
  }
}

export const mediaService = new MediaService();