# Core Inspection Gateway

System of Record backend for the Inspection Platform.
Powered by Node.js, Fastify, Prisma, and Cloud Run.

## Architecture

*   **Database**: PostgreSQL (System of Record)
*   **Auth**: JWT (User) + Shared Secret (Service-to-Service)
*   **Orchestration**: Direct clients to Billing, Media, Jobs

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Database**
    ```bash
    # Start Postgres (if using Docker)
    docker run -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

    # Run Migrations
    npm run prisma:migrate
    ```

3.  **Run Locally**
    ```bash
    cp .env.example .env
    npm run dev
    ```

## Diagnostics

*   **Liveness**: `GET /v1/health`
*   **Readiness**: `GET /v1/ready` (Checks DB and Downstream Services)

## Deploy to Cloud Run

1.  Build Container
    ```bash
    gcloud builds submit --tag gcr.io/PROJECT_ID/gateway
    ```

2.  Deploy
    ```bash
    gcloud run deploy gateway \
      --image gcr.io/PROJECT_ID/gateway \
      --set-env-vars="NODE_ENV=production,DATABASE_URL=...,JWT_JWKS_URL=..."
    ```

## Merge Engine Rules

1.  Human edits to `Condition Flags` or `Overview Comment` always win.
2.  On re-analysis, previous AI issues are wiped, but Human issues are preserved.
3.  Overrides link new Human issues to old AI issues for training data loop.
