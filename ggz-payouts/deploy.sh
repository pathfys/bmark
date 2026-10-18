#!/bin/bash
# GGZ Payouts — deployment script for VPS
# Run on server: bash deploy.sh
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== GGZ Payouts Deploy ==="

echo "[1/3] Deploying frontend..."
mkdir -p /var/www/ggzpays/chunks
cp "$SCRIPT_DIR/index.html" /var/www/ggzpays/index.html
cp "$SCRIPT_DIR/app-styles.css" /var/www/ggzpays/app-styles.css
cp "$SCRIPT_DIR/chunks/c0.js" /var/www/ggzpays/chunks/c0.js
cp "$SCRIPT_DIR/chunks/c1.js" /var/www/ggzpays/chunks/c1.js
cp "$SCRIPT_DIR/chunks/c2.js" /var/www/ggzpays/chunks/c2.js
cp "$SCRIPT_DIR/chunks/c3.js" /var/www/ggzpays/chunks/c3.js

echo "  index.html:     $(wc -c < /var/www/ggzpays/index.html) bytes"
echo "  app-styles.css: $(wc -c < /var/www/ggzpays/app-styles.css) bytes"
for f in /var/www/ggzpays/chunks/c*.js; do
  echo "  $(basename $f):        $(wc -c < $f) bytes"
done

echo "[2/3] Restarting backend..."
if pm2 describe ggz-payouts &>/dev/null; then
  pm2 restart ggz-payouts
else
  echo "  pm2 process not found, skipping"
fi

echo "[3/3] Health check..."
sleep 2
curl -sf http://localhost:8093/api/health && echo "" || echo "  WARNING: health check failed"

echo ""
echo "=== Done ==="
echo "Update BotFather Web App URL to: https://ggzpays.online/?v=8"
echo "Close Telegram completely, then test."
