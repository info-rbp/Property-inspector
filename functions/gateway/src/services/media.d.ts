import { BaseClient } from './base';
declare class MediaService extends BaseClient {
    constructor();
    initiateUpload(tenantId: string, payload: {
        filename: string;
        contentType: string;
        sizeBytes: number;
    }): Promise<{
        mediaId: string;
        uploadUrl: string;
        expiresAt: string;
    }>;
    completeUpload(tenantId: string, mediaId: string): Promise<{
        status: string;
        url: string;
        checksum: string;
    }>;
}
export declare const mediaService: MediaService;
export {};
