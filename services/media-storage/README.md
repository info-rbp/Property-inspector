# Media Storage Service

A multi-tenant backend service for handling inspection media.

## Architecture (Option A)

- **Runtime**: Google Cloud Run (Node.js)
- **Storage**: Google Cloud Storage (Originals & Thumbnails)
- **Database**: Firestore (Metadata)
- **Async Processing**: Cloud Pub/Sub + Cloud Run (Worker endpoint)

## Local Development

1. **Setup Env**: Copy `.env.example` to `.env`
2. **Install**: `npm install`
3. **Run**: `npm run dev`

## API Usage

### Authentication
Headers: `Authorization: Bearer <base64_json_token>`
Mock Token Gen: `btoa(JSON.stringify({ tenantId: 't1', userId: 'u1' }))`

### Workflow
1. **POST** `/v1/media/initiate-upload` -> Get Signed URL
2. **PUT** to Signed URL -> Upload File
3. **POST** `/v1/media/complete-upload` -> Trigger Processing
