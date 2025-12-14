# Deployment Guide

## Prerequisites
- Node.js 20+
- Firebase CLI (`firebase-tools`)
- Google Cloud SDK with `gcloud` authenticated and a default project set.
- Artifact Registry repository for container images (adjust `gateway` repo name in the script if needed).

## Backend (Cloud Run)
1. Ensure environment variables/secrets exist (Secret Manager for `DATABASE_URL`, `JWT_JWKS_URL`, `SERVICE_AUTH_SECRET`, `JWT_SECRET`).
2. Build and deploy using the helper script:
   ```bash
   export PROJECT_ID="<gcp-project-id>"
   export REGION="us-central1"
   export API_BASE_URL="https://<cloud-run-url>" # optional override
   export CORS_ORIGIN="https://<firebase-hosting-domain>"
   ./scripts/deploy-backend.sh
   ```
3. After deployment, retrieve the service URL:
   ```bash
   gcloud run services describe gateway-api --region $REGION --format='value(status.url)'
   ```
4. Set `VITE_API_BASE_URL` to the Cloud Run URL for frontend builds.

## Frontend (Firebase Hosting)
1. Install dependencies and build the SPA:
   ```bash
   npm ci
   npm run build:web
   ```
2. Configure Firebase environment for Hosting (populate `firebase-hosting.env` from `firebase-hosting.env.example`):
   ```bash
   firebase hosting:env:apply firebase-hosting.env
   ```
3. Deploy Hosting:
   ```bash
   firebase deploy --only hosting --project <gcp-project-id>
   ```

## Local Development
- Run gateway and web together:
  ```bash
  npm run dev:gateway
  npm run dev:web -- --host 0.0.0.0
  ```
- Set `VITE_API_BASE_URL=http://localhost:8080` for the SPA to reach the local gateway.
