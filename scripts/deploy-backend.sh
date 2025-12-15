#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME=${SERVICE_NAME:-gateway-api}
REGION=${REGION:-us-central1}
PROJECT_ID=${PROJECT_ID:?"PROJECT_ID must be set"}
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/gateway/gateway-api:$(date +%Y%m%d%H%M%S)"

echo "Building container image ${IMAGE}"
gcloud builds submit --tag "${IMAGE}" --project "${PROJECT_ID}" --file functions/gateway/Dockerfile .

echo "Deploying to Cloud Run service ${SERVICE_NAME}"
gcloud run deploy "${SERVICE_NAME}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --image "${IMAGE}" \
  --port 8080 \
  --set-env-vars NODE_ENV=production,API_BASE_URL="${API_BASE_URL:-}" \
  --set-env-vars CORS_ORIGIN="${CORS_ORIGIN:-}" \
  --set-env-vars LOG_LEVEL="${LOG_LEVEL:-info}" \
  --set-secrets DATABASE_URL=${DATABASE_URL_SECRET:-gateway-database}:latest \
  --set-secrets JWT_JWKS_URL=${JWT_JWKS_SECRET:-gateway-jwks}:latest \
  --set-secrets SERVICE_AUTH_SECRET=${SERVICE_AUTH_SECRET_NAME:-gateway-service-secret}:latest \
  --set-secrets JWT_SECRET=${JWT_SECRET_NAME:-gateway-jwt-secret}:latest \
  --set-env-vars MEDIA_SERVICE_URL="${MEDIA_SERVICE_URL:-}",BILLING_SERVICE_URL="${BILLING_SERVICE_URL:-}",JOBS_SERVICE_URL="${JOBS_SERVICE_URL:-}" \
  --set-env-vars AUDIT_SERVICE_URL="${AUDIT_SERVICE_URL:-}",REPORT_SERVICE_URL="${REPORT_SERVICE_URL:-}"

echo "Deployment complete. Fetch service URL with: gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)'"
