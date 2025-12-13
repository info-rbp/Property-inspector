# Background Jobs Orchestrator

A production-ready, multi-tenant orchestration service for property inspections, running on Google Cloud Run with Firestore and Cloud Tasks.

## Prerequisites

1. Google Cloud Project
2. gcloud CLI installed
3. Node.js 18+

## Setup

### 1. Environment

Copy `.env.example` to `.env` and fill in your values.

### 2. Create Cloud Task Queue

```bash
gcloud tasks queues create orchestrator-queue \
    --location=us-central1
```

### 3. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
# OR manually apply firestore.indexes.json in GCP Console
```

## Local Development

You need GCP credentials locally.

```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/key.json"
npm install
npm run dev
```

For the worker to function locally, you need a public tunnel (like ngrok) to point `WORKER_URL` to your localhost, because Cloud Tasks cannot reach `localhost`.

## API Usage

### Create a Job

```bash
curl -X POST http://localhost:8080/v1/jobs \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tnt_123" \
  -H "X-User-ID: user_abc" \
  -d '{
    "type": "ANALYZE_INSPECTION",
    "inspectionId": "insp_999",
    "input": {
        "analysisMode": "DEEP",
        "roomIds": ["room_1"]
    }
  }'
```

### Check Status

```bash
curl http://localhost:8080/v1/jobs/{jobId} \
  -H "X-Tenant-ID: tnt_123"
```

## Internal Worker Simulation (Manual Trigger)

You can simulate a Cloud Task execution manually:

```bash
curl -X POST http://localhost:8080/internal/worker/run \
  -H "Content-Type: application/json" \
  -H "X-Service-Auth: dev-secret" \
  -d '{
    "jobId": "job_uuid_here",
    "idempotencyKey": "uuid_here"
  }'
```

## Architecture

1. **Job Creation**: API writes to Firestore (QUEUED) -> Enqueues Cloud Task.
2. **Execution**: Cloud Task hits `/internal/worker/run`.
3. **Idempotency**: Worker uses Firestore transactions to ensure a job runs once.
4. **Retries**: Custom exponential backoff implemented in `workerCore.ts` (re-queues tasks with `scheduleTime`).
5. **Chaining**: `ANALYZE_INSPECTION` handler triggers `GENERATE_REPORT` job creation on success.

## Deployment

```bash
gcloud run deploy orchestrator \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars PROJECT_ID=my-project,SERVICE_AUTH_SECRET=strong_pass
```

*Note: In production, do not allow unauthenticated access. Configure Cloud Tasks OIDC tokens or use the Service Auth secret approach provided here for a foundation.*
