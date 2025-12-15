import { Buffer } from 'buffer';
export declare class StorageService {
    /**
     * Uploads a PDF buffer to GCS
     */
    uploadPdf(path: string, buffer: Buffer, metadata: Record<string, string>): Promise<void>;
    /**
     * Generates a signed URL for reading
     */
    getSignedUrl(path: string): Promise<string>;
}
export declare const storageService: StorageService;
