
# Notifications Service

A multi-tenant, reliable notification service for the Inspection Platform.

## Features

- **Reliability**: Idempotent sending, retries with exponential backoff, dead-letter handling.
- **Isolation**: Strict tenant scoping.
- **Templating**: MJML + Handlebars support with database-backed versioning.
- **Branding**: Dynamic injection of tenant logos and colors.

## Tech Stack

- Node.js (TypeScript)
- Express
- PostgreSQL
- Google Cloud Tasks (Queue)
- Nodemailer (SMTP)

## Local Development

### Prerequisites

1. PostgreSQL running locally.
2. Node.js 18+

### Setup

1. Copy env file:
   ```bash
   cp .env.example .env
   ```
   Update `DATABASE_URL` and `SERVICE_AUTH_SECRET`.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run Migrations & Seed Templates:
   ```bash
   npm run migrate
   ```

4. Start Server:
   ```bash
   npm run dev
   ```

### Mocking Cloud Tasks Locally

In `.env`, set `CLOUD_TASKS_PROJECT=local`. The service will bypass Google Cloud and dispatch the worker task directly via HTTP after a `setTimeout`.

## API Usage

### Send Notification

```bash
curl -X POST http://localhost:8080/v1/notifications/send \
  -H "Content-Type: application/json" \
  -H "X-Service-Auth: dev-secret-123" \
  -d '{
    "tenantId": "tenant_1",
    "type": "REPORT_READY",
    "channel": "email",
    "to": "client@example.com",
    "templateId": "report_ready",
    "idempotencyKey": "unique-req-id-123",
    "triggeredBy": { "actorType": "system" },
    "variables": {
      "propertyAddress": "123 Main St",
      "inspectionDate": "2023-10-27",
      "reportDownloadUrl": "http://download.link"
    }
  }'
```

## Deployment (GCP)

1. **Build container**:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/notifications-service
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy notifications-service \
     --image gcr.io/PROJECT_ID/notifications-service \
     --platform managed \
     --allow-unauthenticated \
     --set-env-vars="DATABASE_URL=...,SERVICE_AUTH_SECRET=..."
   ```

3. **Create Cloud Task Queue**:
   ```bash
   gcloud tasks queues create notifications-queue
   ```
