import * as admin from 'firebase-admin';
import { MediaMetadata, MediaStatus, RetentionPolicy } from '../types';
import { config } from '../config';

// Initialize Firebase only if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const db = admin.firestore();
const collection = db.collection(config.FIRESTORE_COLLECTION);
const retentionCollection = db.collection(config.FIRESTORE_RETENTION_COLLECTION || 'retention_policies');

export const createMediaRecord = async (data: MediaMetadata) => {
  await collection.doc(data.mediaId).set(data);
};

export const updateMediaStatus = async (mediaId: string, status: MediaStatus, updates?: Partial<MediaMetadata>) => {
  await collection.doc(mediaId).update({
    status,
    ...updates,
  });
};

export const getMediaRecord = async (mediaId: string, tenantId: string): Promise<MediaMetadata | null> => {
  const doc = await collection.doc(mediaId).get();
  if (!doc.exists) return null;
  const data = doc.data() as MediaMetadata;
  // Tenant isolation enforcement
  if (data.tenantId !== tenantId) return null;
  return data;
};

export const listInspectionMedia = async (
  tenantId: string, 
  inspectionId: string, 
  filters: { roomId?: string; componentId?: string; status?: string }
) => {
  let query = collection
    .where('tenantId', '==', tenantId)
    .where('inspectionId', '==', inspectionId);

  // Exclude deleted by default unless specifically asked
  query = query.where('status', '!=', MediaStatus.DELETED);

  if (filters.roomId) query = query.where('roomId', '==', filters.roomId);
  if (filters.componentId) query = query.where('componentId', '==', filters.componentId);
  if (filters.status) query = query.where('status', '==', filters.status);

  const snapshot = await query.orderBy('uploadedAt', 'desc').limit(100).get();
  return snapshot.docs.map(doc => doc.data() as MediaMetadata);
};

export const findExpiredMedia = async () => {
  const now = new Date().toISOString();
  return collection
    .where('status', '==', MediaStatus.READY)
    .where('isLegalHold', '==', false)
    .where('expiresAt', '<', now)
    .limit(50) 
    .get();
};

export const setLegalHold = async (mediaId: string, tenantId: string, isHold: boolean) => {
  const docRef = collection.doc(mediaId);
  await db.runTransaction(async (t) => {
    const doc = await t.get(docRef);
    if (!doc.exists) throw new Error("Media not found");
    const data = doc.data() as MediaMetadata;
    if (data.tenantId !== tenantId) throw new Error("Unauthorized");
    t.update(docRef, { isLegalHold: isHold });
  });
};

// Retention Policies

export const createRetentionPolicy = async (policy: RetentionPolicy) => {
  await retentionCollection.doc(policy.policyId).set(policy);
};

export const getRetentionPolicy = async (policyId: string, tenantId: string): Promise<RetentionPolicy | null> => {
  const doc = await retentionCollection.doc(policyId).get();
  if (!doc.exists) return null;
  const data = doc.data() as RetentionPolicy;
  if (data.tenantId !== tenantId) return null;
  return data;
};

export const listRetentionPolicies = async (tenantId: string) => {
  const snapshot = await retentionCollection
    .where('tenantId', '==', tenantId)
    .where('isActive', '==', true)
    .get();
  return snapshot.docs.map(doc => doc.data() as RetentionPolicy);
};

export const updateMediaRetention = async (mediaId: string, tenantId: string, policyId: string, retentionUntil: string) => {
  const docRef = collection.doc(mediaId);
  await db.runTransaction(async (t) => {
    const doc = await t.get(docRef);
    if (!doc.exists) throw new Error("Media not found");
    const data = doc.data() as MediaMetadata;
    if (data.tenantId !== tenantId) throw new Error("Unauthorized");
    
    t.update(docRef, { 
        appliedPolicyId: policyId,
        retentionUntil: retentionUntil
    });
  });
};