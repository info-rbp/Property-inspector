# Audit Log

## Phase 0: Baseline and Workspace Layout
- Monorepo managed via npm workspaces (packageManager set to pnpm@8.15.8) with root `package-lock.json`; workspaces include `packages/web` (frontend), `packages/gateway` (backend), and multiple services under `services/` plus `packages/contracts`. Root scripts orchestrate dev/build across gateway and web.
- Frontend: Vite React SPA in `packages/web` (entry `index.tsx`, `App.tsx`). Backend/API: Fastify service in `packages/gateway` (TypeScript, compiled to `dist/server.js`). Additional ancillary services exist but are out of scope for initial Cloud Run slice.

## Phase 1 Findings: Generator/Platform-Specific Assumptions

### A) Hardcoded endpoints and local-only URLs
- `setup.sh` seeds `.env.local` with `VITE_API_URL=http://localhost:3001` and prints localhost URLs, assuming local dev hostnames. (lines 31-96) [Severity: Medium]
- Gateway swagger server URL defaults to `process.env.API_BASE_URL || 'http://localhost:3001'`, embedding localhost when env absent. (packages/gateway/src/app.ts:40-43) [Severity: Medium]
- CORS default allows `['http://localhost:3000']` and server host defaults to `0.0.0.0` with logs referencing localhost. (packages/gateway/src/app.ts:23-25, packages/gateway/src/server.ts:46-59) [Severity: Medium]
- Various service configs (e.g., background-jobs, notifications) hardcode localhost defaults; flagged but not addressed in current slice. [Severity: Low]

### B) Environment variable usage sprawl
- Gateway reads `process.env` directly across server bootstrap, middleware, routes, and health checks instead of centralized config (`src/server.ts`, `src/app.ts`, `src/routes/*`, `src/middleware/*`, `src/db/client.ts`). [Severity: High]
- Frontend Gemini service pulls `import.meta.env.VITE_API_KEY` directly and no shared config module exists. (packages/web/services/geminiService.ts) [Severity: Medium]
- Multiple services load dotenv and use process env scattered through modules (e.g., services/background-jobs/src/config.ts, services/identity/src/config/env.ts). Out of scope for initial deployment slice but noted. [Severity: Low]

### C) File system and ephemeral state
- UI tooling scripts under `apps/inspection-ui` write files to disk (e.g., `fs.writeFileSync('./dist/_worker.js')`), indicating local build artifacts; not part of target deployment. [Severity: Low]

### D) CORS and auth shortcuts
- Several services (identity, billing, audit, notifications) call `app.use(cors())` with permissive defaults. Gateway CORS origin defaults to localhost without production override. [Severity: Medium]

### E) Build and output directories
- Web frontend uses Vite; build output expected at `packages/web/dist` (referenced by existing `firebase.json`). Vite config already binds host `0.0.0.0` and port 3000. [Severity: Info]

## Notes
- Existing Firebase Hosting config targets `packages/web/dist` with emulator port 5000. IDX preview currently passes unsupported port flag in `.idx/dev.nix` schema and needs adjustment.

## Additional Notes
- `npm install` fails at workspace resolution because `services/knowledge-standards` declares an invalid package name (`knowledge-&-standards-admin`). Installation and builds should target specific packages or fix the package name before running workspace-wide installs.
