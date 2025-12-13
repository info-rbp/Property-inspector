
# Audit & Evidence Service

A legal-grade, immutable audit log service for Property Inspections. This service provides a tamper-resistant record of all AI and Human actions within the platform.

## Guarantees

1.  **Immutability**: Records are append-only. No API exists to UPDATE or DELETE.
2.  **Integrity**: Every payload is hashed (SHA256).
3.  **Traceability**: Events are hash-chained per entity (blockchain-lite) to prove sequence.
4.  **Isolation**: Multi-tenant architecture ensures tenants only access their own logs.

## Setup

### Prerequisites
*   Node.js 18+
*   Google Cloud Project (Firestore, Cloud Storage)
*   Service Account JSON (for local dev)

### Installation

1.  Clone repo
2.  `npm install`
3.  Copy `.env.example` to `.env` and fill values.
4.  `npm run dev`

### Local Development (Firestore)

This project uses Firebase Admin. For local dev, ensure you have:
`export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"`

## API Usage

### 1. Write Event (Internal Only)

**POST** `/v1/audit/events`
Header: `Authorization: Bearer <SERVICE_AUTH_SECRET>`

```json
{
  "tenantId": "tnt_1",
  "entityType": "inspection",
  "entityId": "insp_123",
  "eventType": "AI_ANALYSIS_COMPLETED",
  "actorType": "ai",
  "actorId": "gemini-2.5-pro",
  "sourceService": "analysis-app",
  "payload": {
    "summary": "Water damage detected",
    "confidence": 0.98
  }
}
```

### 2. Read History (Tenant User)

**GET** `/v1/audit/entities/inspection/insp_123?tenantId=tnt_1`
Header: `Authorization: Bearer <USER_JWT>`

Returns a chronologically sorted list of events. If a payload was large (>50KB), the response includes a `payloadDownloadUrl` (signed GCS URL) instead of the raw JSON.

### 3. Inspection Summary (Dispute Review)

**GET** `/v1/audit/inspections/insp_123/summary?tenantId=tnt_1`

Returns aggregated stats on AI vs Human activity for the inspection.

## Architecture Notes

*   **Hash Chaining**: The system uses a Firestore Transaction to locate the previous event for the specific entity and includes its `payloadHash` in the new record (`previousHash`). This allows reconstruction of the timeline and detection of missing records.
*   **Payload Offloading**: Payloads larger than `PAYLOAD_SIZE_INLINE_LIMIT` are automatically uploaded to Cloud Storage. A reference is stored in Firestore.
