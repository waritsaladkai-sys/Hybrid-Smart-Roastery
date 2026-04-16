#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Eight Coffee Roasters — Quick Deploy Script
# Usage: bash scripts/deploy.sh [service]
# Example: bash scripts/deploy.sh        (deploy all)
#          bash scripts/deploy.sh api    (deploy only api)
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SERVICE="${1:-all}"
DEPLOY_DIR="/opt/eight-coffee"
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }

cd "$DEPLOY_DIR"

log "Pulling latest images..."
docker compose pull

if [ "$SERVICE" = "all" ]; then
  log "Restarting all services..."
  docker compose up -d --remove-orphans
else
  log "Restarting $SERVICE..."
  docker compose up -d --no-deps "$SERVICE"
fi

log "Running Prisma migrations..."
docker compose exec -T api npx prisma migrate deploy || warn "Migration skipped (DB may not be ready)"

sleep 5
log "Health check..."
curl -sf http://localhost:4000/api/v1/health && log "API OK" || warn "API not healthy yet"
curl -sf http://localhost:3000 && log "Web OK" || warn "Web not healthy yet"

log "Cleaning unused images..."
docker image prune -f

log "Deploy complete! SHA: $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
docker compose ps
