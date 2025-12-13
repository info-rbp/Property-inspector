
# Billing & Usage Metering Service

A centralized, event-driven microservice for handling SaaS metering, entitlements, and subscription enforcement.

## Architecture Philosophy

1.  **Single Source of Truth**: This service owns the logic for "Can User X do Y?"
2.  **Immutable Events**: We never just increment a counter. We log *why* usage happened (Source Entity ID).
3.  **Tenant Isolation**: All queries are scoped by Tenant ID.
4.  **No Payments**: This service prepares data for Stripe, but does not execute charges.

## Tech Stack

*   Node.js & TypeScript
*   PostgreSQL (Cloud SQL)
*   Prisma ORM
*   Express.js

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment**
    Copy `.env.example` to `.env` and configure DB URL.

3.  **Database Migration & Seed**
    ```bash
    npx prisma migrate dev --name init
    npm run seed
    ```

4.  **Run**
    ```bash
    npm run dev
    ```

## Integration Guide

### 1. Checking Entitlements (Before performing work)

Call this from your Photo Analysis Service or UI.

**POST** `/v1/billing/entitlements/check`

**Headers:**
*   Frontend: `Authorization: Bearer <user_jwt>`
*   Service: `X-Service-Secret: <your_secret>`

**Body:**
```json
{
  "tenantId": "tnt_123",
  "usageType": "PHOTO_ANALYSIS_DEEP",
  "quantity": 1
}
```

**Response:**
```json
{
  "allowed": true,
  "remaining": 15,
  "reason": "within_plan"
}
```
*If `allowed: false` and `hardStop: true` in the plan, your service MUST abort the operation.*

### 2. Recording Usage (After work is done)

Call this from your internal workers. **Idempotent** based on `sourceService` + `sourceEntityId` + `usageType`.

**POST** `/v1/billing/usage`

**Headers:** `X-Service-Secret: <your_secret>`

**Body:**
```json
{
  "tenantId": "tnt_123",
  "usageType": "PHOTO_ANALYSIS_DEEP",
  "quantity": 1,
  "sourceService": "analysis-worker",
  "sourceEntityId": "job_abc_123" 
}
```

## Adding New Usage Types

1.  Add the key to `src/types/index.ts` enum.
2.  Update the seed script `prisma/seed.ts` to include limits for this new type in the Plans.
3.  Deploy.

## Enforcement Logic

*   **Hard Stop**: If plan limit reached, Entitlement API returns `allowed: false`.
*   **Soft Limit (Overage)**: If plan allows overage, Entitlement API returns `allowed: true`, but `isExceeded` flag will appear in summaries.
