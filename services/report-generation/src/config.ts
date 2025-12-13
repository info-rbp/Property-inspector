import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 8080,
  projectId: process.env.PROJECT_ID || 'local-project',
  bucketName: process.env.REPORT_BUCKET_NAME || 'local-reports',
  brandingUrl: process.env.BRANDING_SERVICE_URL || 'http://localhost:3001',
  inspectionUrl: process.env.INSPECTION_SERVICE_URL || 'http://localhost:3002',
  signedUrlTtl: parseInt(process.env.SIGNED_URL_TTL_SECONDS || '900', 10),
  isDev: process.env.NODE_ENV === 'development',
};