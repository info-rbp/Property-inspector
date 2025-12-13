import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 8080,
  GCLOUD_PROJECT: process.env.GCLOUD_PROJECT || 'local-project',
  GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME || 'media-bucket',
  PUBSUB_TOPIC: process.env.PUBSUB_TOPIC || 'media-processing',
  FIRESTORE_COLLECTION: 'media',
  FIRESTORE_RETENTION_COLLECTION: 'retention_policies',
  
  // Auth
  JWT_JWKS_URL: process.env.JWT_JWKS_URL || '',
  JWT_ISSUER: process.env.JWT_ISSUER || '',
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'pia-platform',
  SERVICE_AUTH_SECRET: process.env.SERVICE_AUTH_SECRET || 'change-me-local-secret',

  // Policies
  RETENTION_DAYS_DEFAULT: 365,
  UPLOAD_EXPIRY_MINUTES: 15,
  READ_EXPIRY_MINUTES: 15, // Short-lived read URLs
};