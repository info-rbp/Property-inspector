import * as admin from 'firebase-admin';
import { MediaMetadata, MediaStatus, RetentionPolicy } from '../types';
export declare const db: admin.firestore.Firestore;
export declare const createMediaRecord: (data: MediaMetadata) => Promise<void>;
export declare const updateMediaStatus: (mediaId: string, status: MediaStatus, updates?: Partial<MediaMetadata>) => Promise<void>;
export declare const getMediaRecord: (mediaId: string, tenantId: string) => Promise<MediaMetadata | null>;
export declare const listInspectionMedia: (tenantId: string, inspectionId: string, filters: {
    roomId?: string;
    componentId?: string;
    status?: string;
}) => Promise<MediaMetadata[]>;
export declare const findExpiredMedia: () => Promise<admin.firestore.QuerySnapshot<admin.firestore.DocumentData, admin.firestore.DocumentData>>;
export declare const setLegalHold: (mediaId: string, tenantId: string, isHold: boolean) => Promise<void>;
export declare const createRetentionPolicy: (policy: RetentionPolicy) => Promise<void>;
export declare const getRetentionPolicy: (policyId: string, tenantId: string) => Promise<RetentionPolicy | null>;
export declare const listRetentionPolicies: (tenantId: string) => Promise<RetentionPolicy[]>;
export declare const updateMediaRetention: (mediaId: string, tenantId: string, policyId: string, retentionUntil: string) => Promise<void>;
