#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Eight Coffee Roasters — RPi5 First-Time Setup & Deploy Script
# Run: bash scripts/setup-rpi.sh
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

DEPLOY_DIR="/opt/eight-coffee"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo "══════════════════════════════════════════"
echo "  Eight Coffee Roasters — RPi5 Setup"
echo "══════════════════════════════════════════"
echo ""

# ── 1. Update system ──────────────────────────────────────────
log "Updating system packages..."
sudo apt-get update -qq && sudo apt-get upgrade -y -qq

# ── 2. Install Docker ─────────────────────────────────────────
if ! command -v docker &> /dev/null; then
  log "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  log "Docker installed. NOTE: Re-login required for group change."
else
  log "Docker already installed: $(docker --version)"
fi

# ── 3. Install Docker Compose plugin ─────────────────────────
if ! docker compose version &> /dev/null; then
  log "Installing Docker Compose plugin..."
  sudo apt-get install -y docker-compose-plugin
else
  log "Docker Compose: $(docker compose version)"
fi

# ── 4. Mount Synology NAS ─────────────────────────────────────
log "Setting up NAS mount..."
sudo mkdir -p /mnt/nas/media /mnt/nas/backup

if ! mountpoint -q /mnt/nas; then
  warn "NAS not mounted. Add to /etc/fstab:"
  echo "  //192.168.x.x/share /mnt/nas cifs credentials=/root/.nasrc,uid=1000,gid=1000,iocharset=utf8 0 0"
  warn "Create /root/.nasrc with: username=xxx\\npassword=xxx"
else
  log "NAS already mounted at /mnt/nas"
fi

# ── 5. Create deploy directory ────────────────────────────────
log "Setting up deploy directory at $DEPLOY_DIR..."
sudo mkdir -p "$DEPLOY_DIR"
sudo chown "$USER:$USER" "$DEPLOY_DIR"

# ── 6. Copy project files ─────────────────────────────────────
if [ -f "docker-compose.yml" ]; then
  cp docker-compose.yml "$DEPLOY_DIR/"
  cp .env.example "$DEPLOY_DIR/.env.example"
  log "docker-compose.yml copied to $DEPLOY_DIR"
else
  warn "Run this script from the project root directory"
fi

# ── 7. Create docker volume dirs ─────────────────────────────
mkdir -p "$DEPLOY_DIR/docker/media"
mkdir -p "$DEPLOY_DIR/docker/backups"
log "Docker volume directories created"

# ── 8. Setup .env ─────────────────────────────────────────────
if [ ! -f "$DEPLOY_DIR/.env" ]; then
  cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
  warn ".env created from example. Edit it before starting:"
  warn "  nano $DEPLOY_DIR/.env"
else
  log ".env already exists (skipped)"
fi

# ── 9. Setup systemd auto-start ───────────────────────────────
log "Setting up systemd service for auto-start..."
sudo bash -c "cat > /etc/systemd/system/eight-coffee.service" << EOF
[Unit]
Description=Eight Coffee Roasters Stack
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=300
User=$USER

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable eight-coffee.service
log "Systemd service enabled (auto-starts on boot)"

# ── 10. Setup log rotation ────────────────────────────────────
sudo bash -c "cat > /etc/logrotate.d/eight-coffee" << EOF
$DEPLOY_DIR/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
}
EOF
log "Log rotation configured"

# ── 11. Summary ───────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════"
echo "  Setup Complete!"
echo "══════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Edit .env:  nano $DEPLOY_DIR/.env"
echo "  2. Start:      cd $DEPLOY_DIR && docker compose up -d"
echo "  3. Seed DB:    docker compose exec api npx prisma db seed"
echo "  4. View logs:  docker compose logs -f"
echo ""
echo "  GitHub Secrets needed for CI/CD:"
echo "    RPI_HOST     — IP address (e.g. 192.168.1.100)"
echo "    RPI_USER     — SSH user (e.g. pi)"
echo "    RPI_SSH_KEY  — Private SSH key (cat ~/.ssh/id_rsa)"
echo "    LINE_CHANNEL_ACCESS_TOKEN — for deploy notifications"
echo ""
