# Monorepo Structure

- apps/     → user-facing applications and gateway
- services/ → internal backend services
- packages/ → shared contracts and utilities
- infra/    → local and deployment infrastructure

## Automation
- GitHub Actions workflow `.github/workflows/subtree-import.yml` automates subtree imports for platform services and updates stack detection.

## Tracking empty directories
- Placeholder `.gitkeep` files live in `services/`, `infra/`, and `packages/contracts/` so these structural paths remain tracked even when empty.
