# Report Generation Service

A standalone backend service for generating immutable, versioned PDF inspection reports using Playwright.

## Features

- **HTML-to-PDF Conversion**: Uses Playwright for high-fidelity rendering.
- **Tenant Isolation**: All operations scoped by `tenantId`.
- **Template System**: Versioned Handlebars templates.
- **Locking**: Finalized reports cannot be regenerated or modified.
- **Audit**: Stores SHA256 checksums of generated PDFs.

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (optional, for Playwright dependencies)
- Google Cloud SDK (for local auth emulation)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

### Local Development

1. Copy env file:
   ```bash
   cp .env.example .env
   ```
2. Run development server:
   ```bash
   npm run dev
   ```

### API Usage

**Generate Report:**

```http
POST /v1/reports/generate
Headers:
  x-tenant-id: tnt_123
Body:
{
  "inspectionId": "insp_456",
  "templateId": "template_modern_v1",
  "finalize": false
}
```

**Finalize Report:**

```http
POST /v1/reports/{reportId}/finalize
Headers:
  x-tenant-id: tnt_123
```

## Adding Templates

1. Create a new HTML file in `src/templates/` (e.g., `commercial_v2.html`).
2. Use Handlebars syntax for dynamic data.
3. Update `src/services/templates.ts` to register the new template ID and path in the `loadTemplates` method.
4. Restart the service.

## Deployment (Cloud Run)

This service requires a Docker environment capable of running Playwright. Ensure your Dockerfile installs the necessary Playwright dependencies (e.g., using `mcr.microsoft.com/playwright:v1.40.0-jammy`).

