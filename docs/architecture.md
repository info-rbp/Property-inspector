# Deployment Architecture

## Components
- **Frontend (`packages/web`)**: Vite React single-page app built to `packages/web/dist`. Served as static assets via Firebase Hosting.
- **Backend/API (`packages/gateway`)**: Fastify Node.js service compiled to `packages/gateway/dist` and deployed as a container on Cloud Run. Listens on `PORT` (default `8080`).

## Networking
- The frontend calls the backend using `VITE_API_BASE_URL` (configured at build/runtime).
  - **Local development**: `VITE_API_BASE_URL=http://localhost:8080` while running `npm run dev:gateway`.
  - **Production**: `VITE_API_BASE_URL` should be set to the Cloud Run service URL (e.g., `https://gateway-api-<region>-<project>.run.app`).
- Firebase Hosting serves the SPA and can call Cloud Run directly over HTTPS.

## Configuration Contract
- **Frontend**
  - Environment reads are centralized in `packages/web/src/config.ts`.
  - Only `import.meta.env.VITE_*` keys are consumed; other modules import values from the config module.
- **Backend**
  - Environment reads are centralized in `packages/gateway/src/config.ts` (Zod-validated; fails fast in production when required keys are missing).
  - Downstream URLs, JWT settings, and port/host values are consumed via this config in server bootstrap, middleware, and routes.
- **Secrets**
  - Sensitive values (database URL, JWT secrets, service auth secret, JWKS URL) should be stored in Secret Manager and injected into Cloud Run via `gcloud run deploy --set-secrets ...`.

## Build & Deploy Flow
1. Install dependencies and build frontend: `npm ci` then `npm run build:web` (outputs `packages/web/dist`).
2. Build backend: `npm run build:gateway` (produces `packages/gateway/dist`).
3. Containerize backend using `packages/gateway/Dockerfile` and deploy to Cloud Run (see `scripts/deploy-backend.sh`).
4. Deploy frontend to Firebase Hosting using `firebase.json` configuration.
