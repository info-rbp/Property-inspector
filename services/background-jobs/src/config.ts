import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 8080,
  projectId: process.env.PROJECT_ID || 'local-project',
  firestore: {
    collection: process.env.JOBS_FIRESTORE_COLLECTION || 'jobs',
    mediaCollection: process.env.MEDIA_COLLECTION || 'media',
  },
  pubsub: {
    topic: process.env.MEDIA_PUBSUB_TOPIC || 'media-processing',
    subscription: process.env.MEDIA_SUBSCRIPTION || 'media-processing-worker',
  },
  tasks: {
    queue: process.env.CLOUD_TASKS_QUEUE || 'orchestrator-queue',
    location: process.env.CLOUD_TASKS_LOCATION || 'us-central1',
    workerUrl: process.env.WORKER_URL || 'http://localhost:8080',
  },
  auth: {
    serviceSecret: process.env.SERVICE_AUTH_SECRET || 'dev-secret',
  },
  services: {
    analysisUrl: process.env.ANALYSIS_BASE_URL || 'http://localhost:3001',
    reportUrl: process.env.REPORT_BASE_URL || 'http://localhost:3002',
    inspectionAppUrl: process.env.INSPECTION_APP_BASE_URL || 'http://localhost:3000',
  },
  defaults: {
    maxAttempts: parseInt(process.env.DEFAULT_MAX_ATTEMPTS || '5', 10),
  },
};