export declare class StorageService {
    /**
     * Uploads a JSON payload to GCS and returns the URI.
     */
    static uploadPayload(tenantId: string, payload: any): Promise<string>;
    /**
     * Generates a signed URL for reading large payloads.
     */
    static getSignedUrl(gcsUri: string): Promise<string>;
}
