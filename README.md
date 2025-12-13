# ProInspect Platform

Multi-tenant, white-label property inspection platform for agencies, inspectors, and landlords to produce defensible, consistent inspection outcomes and professional reports.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker)

### Initial Setup

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Setup environment variables:**
```bash
cp packages/gateway/.env.example packages/gateway/.env
cp packages/web/.env.example packages/web/.env
# Edit .env files with your configuration
```

3. **Start infrastructure services:**
```bash
docker-compose up -d postgres redis minio mailhog
```

4. **Setup database:**
```bash
npm run setup:db
```

5. **Start development servers:**
```bash
# Start all services
npm run dev

# Or start individually
npm run dev:web      # Web application on http://localhost:5173
npm run dev:gateway  # Gateway API on http://localhost:3001
```

## 🏗️ Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    Web Application (React)                   │
│                  • Inspector/Agency Portal                   │
│                  • Remote Inspection Module                  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Gateway API (Fastify)                       │
│              • System of Record (PostgreSQL)                 │
│              • Authentication & Authorization                │
│              • Service Orchestration                         │
└──┬──────────┬──────────┬──────────┬──────────┬─────────────┘
   │          │          │          │          │
┌──▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│Media │ │ Jobs  │ │Billing│ │ Audit │ │Reports│  [Microservices]
└──────┘ └───────┘ └───────┘ └───────┘ └───────┘
```

### Core Services

#### 🌐 Web Application (`packages/web`)
- **Technology:** React, Vite, TypeScript, TailwindCSS
- **Features:** 
  - Property inspection management
  - Photo capture and evidence management
  - AI-powered analysis review
  - Report generation and preview
  - Remote inspection portal

#### 🚪 Gateway Service (`packages/gateway`)
- **Technology:** Fastify, Prisma, PostgreSQL
- **Responsibilities:**
  - Central API gateway
  - Authentication/Authorization
  - Data persistence
  - Service orchestration
  - Webhook handling

#### 📸 Media Storage Service (`services/media-storage`)
- **Technology:** Node.js, MinIO/S3
- **Features:**
  - Secure photo upload/download
  - Image processing and thumbnails
  - Retention policies
  - CDN integration

#### ⚙️ Background Jobs Service (`services/background-jobs`)
- **Technology:** Node.js, Bull Queue, Redis
- **Jobs:**
  - AI photo analysis
  - Report generation
  - Notification dispatch
  - Data synchronization

#### 💳 Billing Service (`services/billing`)
- **Technology:** Node.js, PostgreSQL
- **Features:**
  - Usage metering
  - Subscription management
  - Feature flags
  - Quota enforcement

## 📊 Domain Model

### Core Entities

#### Inspection Types
- **CONDITION_REPORT**: Baseline property condition snapshot
- **ROUTINE**: Periodic tenancy compliance checks
- **EXIT**: Bond/dispute sensitive final inspection
- **REMOTE**: Tenant-submitted evidence with inspector review

#### Inspection Workflow
1. **Create Inspection** → Select type, property, jurisdiction
2. **Capture Evidence** → Upload photos by room/component
3. **AI Analysis** → Extract findings, severity, recommendations
4. **Human Review** → Accept/reject/override AI suggestions
5. **Generate Report** → Create PDF with branding and templates
6. **Finalize** → Lock inspection and report for audit trail

## 🔒 Security & Compliance

### Authentication
- JWT-based user authentication
- Service-to-service shared secrets
- Token-based remote inspection access

### Data Protection
- Tenant isolation at database level
- Immutable audit trail
- Evidence chain of custody
- GDPR-compliant data handling

### Australian Jurisdiction Support
- State/territory specific templates (WA, NSW, VIC, QLD, SA, TAS, ACT, NT)
- Compliance with local regulations
- Jurisdiction-aware AI prompts

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific service tests
npm test --workspace=packages/gateway
npm test --workspace=packages/web

# E2E tests
npm run test:e2e
```

## 📦 Deployment

### Local Development
```bash
docker-compose up
```

### Production (Google Cloud Run)

1. **Build and push images:**
```bash
# Gateway
gcloud builds submit --tag gcr.io/PROJECT_ID/gateway packages/gateway

# Web app
gcloud builds submit --tag gcr.io/PROJECT_ID/web packages/web
```

2. **Deploy services:**
```bash
# Deploy gateway
gcloud run deploy gateway \
  --image gcr.io/PROJECT_ID/gateway \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy web app
gcloud run deploy web \
  --image gcr.io/PROJECT_ID/web \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🗂️ Project Structure

```
proinspect-platform/
├── packages/
│   ├── web/                 # React web application
│   └── gateway/              # Core API gateway
├── services/
│   ├── media-storage/        # Media handling service
│   ├── background-jobs/      # Job orchestration
│   ├── billing/              # Billing and metering
│   ├── audit/                # Audit trail service
│   ├── notifications/        # Email/SMS notifications
│   ├── report-generation/    # PDF report generator
│   ├── knowledge-standards/  # Standards and rules engine
│   ├── identity/             # User management
│   └── white-label/          # Branding service
├── shared/
│   ├── types/                # Shared TypeScript types
│   └── utils/                # Shared utilities
├── infrastructure/
│   ├── docker/               # Docker configurations
│   └── k8s/                  # Kubernetes manifests
├── docs/
│   ├── api/                  # API documentation
│   └── architecture/         # Architecture decisions
├── docker-compose.yml        # Local development setup
└── package.json              # Monorepo configuration
```

## 🔧 Configuration

### Environment Variables

#### Gateway Service
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `SERVICE_SECRET`: Internal service authentication
- `REDIS_URL`: Redis connection for caching
- `*_SERVICE_URL`: URLs for microservices

#### Web Application
- `VITE_API_URL`: Gateway API endpoint
- `VITE_AUTH_DOMAIN`: Authentication domain
- `VITE_SENTRY_DSN`: Error tracking

## 📝 API Documentation

### Gateway API Endpoints

#### Inspections
- `GET /api/v1/inspections` - List inspections
- `POST /api/v1/inspections` - Create inspection
- `GET /api/v1/inspections/:id` - Get inspection details
- `PUT /api/v1/inspections/:id` - Update inspection
- `POST /api/v1/inspections/:id/finalize` - Finalize inspection

#### Media
- `POST /api/v1/media/initiate-upload` - Get signed upload URL
- `POST /api/v1/media/complete-upload` - Confirm upload completion

#### Analysis
- `POST /api/v1/analysis/start` - Trigger AI analysis
- `GET /api/v1/analysis/:jobId/status` - Check analysis status

#### Reports
- `POST /api/v1/reports/generate` - Generate report
- `GET /api/v1/reports/:id` - Download report

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Copyright © 2024 ProInspect Platform. All rights reserved.

## 🆘 Support

For issues and questions:
- Create an issue in GitHub
- Email: support@proinspect.com
- Documentation: https://docs.proinspect.com