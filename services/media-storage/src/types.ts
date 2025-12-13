export interface UserContext {
  userId: string;
  tenantId: string;
  role?: string;
}

export enum MediaStatus {
  PENDING_UPLOAD = 'pending_upload',
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
  DELETED = 'deleted'
}

export interface RetentionPolicy {
  policyId: string;
  tenantId: string;
  name: string;
  description?: string;
  durationDays: number;
  createdAt: string; // ISO
  createdBy: string; // userId
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
  uploadedAt: string; // ISO date
  processedAt?: string; // ISO date
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
  hash?: string; // SHA256
  
  // Retention & Legal Hold
  expiresAt?: string; // ISO date
  retentionUntil?: string; // ISO date
  appliedPolicyId?: string;
  isLegalHold: boolean;
  deletedAt?: string; // ISO date
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