# Branding Service

A multi-tenant backend service for managing SaaS branding settings, assets, and report configurations. Built with Node.js, TypeScript, Firestore, and Cloud Run.

## Features

- **Tenant Isolation**: Strict `tenantId` scoping.
- **Asset Management**: Signed URL uploads/downloads for logos, letterheads, etc.
- **Validation**: Strict Zod schemas for colors, file types, and sizes.
- **Caching**: ETag support for high-performance client initialization.
- **Templates**: Management of report template selection.

## Prerequisites

- Node.js 18+
- Google Cloud Project with:
  - Firestore (Native mode)
  - Cloud Storage Bucket

## Local Development

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env` and fill in your GCP credentials.
   ```bash
   cp .env.example .env
   ```
   *Note: For local dev, ensure you have `GOOGLE_APPLICATION_CREDENTIALS` set in your shell pointing to a service account key, or use `gcloud auth application-default login`.*

3. **Run in Dev Mode**
   ```bash
   npm run dev
   ```

4. **Testing**
   Use curl or Postman.
   ```bash
   # Health check
   curl http://localhost:8080/v1/health
   ```

## Deployment (Cloud Run)

1. **Build**
   ```bash
   npm run build
   ```

2. **Deploy**
   ```bash
   gcloud run deploy branding-service \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars GCP_PROJECT_ID=your-project,BRANDING_BUCKET_NAME=your-bucket
   ```

## API Reference

### Authentication
Headers: `Authorization: Bearer <JWT>`

### Endpoints

- `GET /v1/branding`: Get current tenant branding (themes, assets with signed URLs).
- `PATCH /v1/branding`: Update theme colors, fonts, settings.
- `POST /v1/branding/assets/initiate-upload`: Get a signed URL to upload a logo/asset.
- `POST /v1/branding/assets/complete-upload`: Finalize an upload.
- `GET /v1/templates`: List available report templates.

## Database Schema (Firestore)

**Collection: `tenants/{tenantId}/branding`**
Document: `settings`
```json
{
  "theme": { "primaryColor": "#ff0000", ... },
  "assets": { "logo": { "path": "...", "mediaId": "..." } },
  "reportBranding": { "templateId": "modern_v1" },
  "brandingVersion": 1,
  "updatedAt": 1700000000
}
```

## Security

- SVG uploads are disabled by default (`ALLOW_SVG=false`) to prevent XSS.
- Max file size is 5MB.
- Users can only modify their own tenant data.
