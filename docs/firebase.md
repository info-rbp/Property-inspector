# Firebase Readiness Checklist

This guide summarizes the code and configuration changes needed to run the ProInspect app reliably on Firebase (Hosting + Cloud Functions + Firestore/Storage). Use it as a practical backlog to align the existing monorepo with Firebase services.

## 1. Web App (packages/web)
- **Hosting target**: Serve the Vite build (`packages/web/dist`) from Firebase Hosting. Add a `firebase.json` hosting entry that points `public` to `packages/web/dist` and rewrites `/**` to `index.html` for SPA routing.
- **Build command**: Configure `firebase.json` with `"predeploy": "npm install && npm run build --workspace packages/web"` to ensure the Vite bundle is produced.
- **Runtime env**: Move the current `.env.local` expectations into Firebase Hosting environment config (via `firebase hosting:env:apply`) so the app can read API base URLs at runtime. Align with existing Vite env usage in `packages/web/vite.config.ts` and `packages/web/utils.ts`.
- **Local preview**: Add Hosting emulation so `firebase emulators:start` serves the built app and proxies API routes.

## 2. API/Gateway alignment (packages/gateway)
- **Deploy target**: Wrap the Fastify gateway in a Firebase Cloud Function (2nd gen) entrypoint. Add an export (e.g., `exports.api = functions.https.onRequest(app)`), updating `packages/gateway` to read Firebase-provided port/host when running in the emulator.
- **Routing**: Mirror the existing API base path so the SPA can call the same endpoints when hosted on Firebase. Consider a Hosting rewrite from `/api/**` to the function.
- **Environment**: Map the current `.env` variables to Firebase Functions config (`firebase functions:config:set ...`) and read them via `process.env` inside `packages/gateway`.

## 3. Data & File Storage
- **Firestore/Storage migration**: The repo currently assumes PostgreSQL/MinIO for persistence (`services/media-storage` uses S3 semantics; `packages/gateway` uses Prisma/PostgreSQL). Decide whether to:
  - Keep existing infra and call it from Cloud Functions (recommended short term), or
  - Port data models to Firestore and media to Firebase Storage (larger effort).
- If staying with external Postgres/MinIO, ensure private networking or appropriate egress is configured from Cloud Functions, and set connection strings in Functions config.

## 4. Background Jobs and Microservices
- The repo has multiple services (`services/background-jobs`, `services/billing`, `services/media-storage`, etc.). For Firebase:
  - **Consolidation**: Consider moving lightweight jobs into Cloud Functions (scheduled functions or pub/sub triggers).
  - **Queues**: Replace Bull/Redis usage with Cloud Tasks or Cloud Pub/Sub, or expose the existing Redis endpoint securely to Functions.
  - **Media**: If migrating to Firebase Storage, update `services/media-storage/src/storage/firestore.ts` and related upload/download logic to use the Storage SDK instead of MinIO/S3 calls.

## 5. Authentication
- Current code references JWT-based auth and placeholders for external providers (`services/white-label/src/middleware/auth.ts`, `services/background-jobs/src/middleware/auth.ts`). Decide on Firebase Auth as the identity provider and:
  - Add token verification middleware using Firebase Admin across HTTP endpoints.
  - Update the SPA to obtain Firebase ID tokens and attach them to API calls.
  - Configure emulator rules for local testing.

## 6. Local Emulator Suite
- Add `firebase.json` entries for Hosting, Functions, Firestore/Storage (as needed), and specify emulator ports. Provide `.firebaserc` with default project.
- Create scripts in `package.json` to run `firebase emulators:start` so developers can preview the full stack alongside the Vite dev server.

## 7. CI/CD
- Extend CI to run `firebase emulators:exec` for integration tests where the SPA talks to the emulated API.
- Add deploy steps for Hosting and Functions (e.g., `firebase deploy --only hosting,functions`).

## 8. Secrets & Config Management
- Store sensitive values (DB URLs, API keys, third-party secrets) in Firebase Functions config or Secret Manager, not in repo `.env` files. Update configuration loading in each service to read from environment variables provided by Firebase.

## 9. Observability
- Enable Firebase Logging/Crashlytics where applicable. For server code, pipe Fastify logs to Cloud Logging. For client errors, consider Firebase Performance/Crashlytics for web.

## 10. Cleanup Tasks
- Remove local-only Docker dependencies from deploy workflows when running on Firebase-only stacks, or keep a hybrid path documented if retaining external Postgres/Redis/MinIO.
- Document the Firebase-specific setup in `README.md` so developers know how to run `firebase init`, configure emulators, and deploy.
