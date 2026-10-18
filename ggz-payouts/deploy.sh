#!/bin/bash
# GGZ Payouts — deployment script for VPS
# Run: bash deploy.sh
# Deploys index.html + app-bundle.js to /var/www/ggzpays/
# and server.py to /root/ggz-payouts/

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== GGZ Payouts Deploy ==="

# Frontend
echo "[1/4] Deploying frontend..."
mkdir -p /var/www/ggzpays
cp "$SCRIPT_DIR/index.html" /var/www/ggzpays/index.html
cp "$SCRIPT_DIR/app-bundle.js" /var/www/ggzpays/app-bundle.js
echo "  -> /var/www/ggzpays/index.html ($(wc -c < /var/www/ggzpays/index.html) bytes)"
echo "  -> /var/www/ggzpays/app-bundle.js ($(wc -c < /var/www/ggzpays/app-bundle.js) bytes)"

# Backend
echo "[2/4] Deploying backend..."
mkdir -p /root/ggz-payouts
cp "$SCRIPT_DIR/server.py" /root/ggz-payouts/server.py
echo "  -> /root/ggz-payouts/server.py"

# Restart backend
echo "[3/4] Restarting ggz-payouts..."
if pm2 describe ggz-payouts &>/dev/null; then
  pm2 restart ggz-payouts
else
  echo "  pm2 process 'ggz-payouts' not found, skipping restart"
fi

# Health check
echo "[4/4] Health check..."
sleep 2
if curl -sf http://localhost:8093/api/health >/dev/null 2>&1; then
  echo "  -> Backend healthy!"
else
  echo "  -> WARNING: Backend health check failed"
fi

echo ""
echo "=== Done! ==="
echo "Test in Telegram: update BotFather Web App URL to https://ggzpays.online/?v=7"
echo "Then close Telegram fully and reopen the Mini App."
