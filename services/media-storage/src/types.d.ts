export interface UserContext {
    userId: string;
    tenantId: string;
    role?: string;
}
export declare enum MediaStatus {
    PENDING_UPLOAD = "pending_upload",
    UPLOADED = "uploaded",
    PROCESSING = "processing",
    READY = "ready",
    FAILED = "failed",
    DELETED = "deleted"
}
export interface RetentionPolicy {
    policyId: string;
    tenantId: string;
    name: string;
    description?: string;
    durationDays: number;
    createdAt: string;
    createdBy: string;
    isActive: boolean;
}
export interface MediaMetadata {
    mediaId: string;
    tenantId: string;
    inspectionId: string;
    roomId?: string;
    componentId?: string;
    status: MediaStatus;
    originalName: string;
    contentType: string;
    sizeBytes: number;
    captureTimestamp?: string;
    uploadedAt: string;
    processedAt?: string;
    labels: string[];
    paths: {
        original: string;
        thumb_sm?: string;
        thumb_md?: string;
    };
    dimensions?: {
        width: number;
        height: number;
    };
    hash?: string;
    expiresAt?: string;
    retentionUntil?: string;
    appliedPolicyId?: string;
    isLegalHold: boolean;
    deletedAt?: string;
}
export interface InitiateUploadRequest {
    inspectionId: string;
    roomId?: string;
    componentId?: string;
    contentType: string;
    fileName: string;
    fileSize: number;
    captureTimestamp?: string;
    labels?: string[];
}
