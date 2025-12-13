
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.PROJECT_ID) {
  throw new Error('PROJECT_ID environment variable is missing');
}

// Initialize Firebase Admin
// In Cloud Run, this uses Application Default Credentials automatically
admin.initializeApp({
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.EVIDENCE_BUCKET_NAME,
});

export const db = admin.firestore();
export const storage = admin.storage();
export const AUDIT_COLLECTION = process.env.AUDIT_COLLECTION || 'audit_events';
