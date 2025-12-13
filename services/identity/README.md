# Identity & Tenant Management Service

A multi-tenant identity provider service for the Property Inspection SaaS. Handles RBAC, JWT issuance, Tenant management, and Entitlements.

## Stack
- Node.js + TypeScript
- PostgreSQL + Prisma
- Express.js
- RS256 JWT Authentication

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env`.
   
   **Generating Keys:**
   This service uses RS256. You must generate a keypair.
   ```bash
   ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
   # Output Public Key
   openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
   ```
   Copy the contents of the generated files into `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` in your `.env` file.

3. **Database**
   Start a Postgres instance (or update DATABASE_URL).
   ```bash
   npm run prisma:migrate
   ```

4. **Run**
   ```bash
   npm run dev
   ```

## API Usage

**Register Tenant (Self-Serve)**
```bash
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@agency.com",
    "password": "securepassword123",
    "fullName": "John Owner",
    "tenantName": "Best Inspections LLC"
  }'
```

**Login**
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@agency.com",
    "password": "securepassword123"
  }'
```

**Diagnostics**

*   **Liveness**: `GET /v1/health`
    *   Returns 200 OK if the process is running.
    *   Use for Kubernetes/Cloud Run liveness probes.
*   **Readiness**: `GET /v1/ready`
    *   Returns 200 OK if Database is connected and Keys are valid.
    *   Returns 503 Service Unavailable if any critical dependency fails.
    *   Response includes detailed status of checks.

## Cloud Run Configuration

When deploying to Google Cloud Run:

1.  **Liveness Probe**:
    *   Path: `/v1/health`
    *   Port: Default (3000)
    *   Initial delay: 5s
    *   Period: 10s

2.  **Startup Probe**:
    *   Path: `/v1/ready`
    *   Failure threshold: 5
    *   Period: 10s
    *   *Note: Cloud Run uses the startup probe to determine when to start sending traffic to a new instance.*

## Testing Diagnostics

Run the service:
```bash
npm run dev
```

In a separate terminal, run the smoke test:
```bash
npx ts-node src/tests/diagnostics.smoke.ts
```

## Integration for Other Services

1. **Photo Analysis App:**
   - Fetch Public Key from `GET /v1/.well-known/jwks.json`.
   - Verify incoming JWTs against this key.
   - Extract `tenantId` from claims to isolate data.

2. **Service-to-Service:**
   - Use `x-api-key` header with keys generated via `POST /v1/api-keys`.
