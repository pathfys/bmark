#!/bin/bash
# Adds Cache-Control directives to the ggzpays.online block in the Caddyfile.
# Idempotent: re-running makes no further changes.
set -euo pipefail

CADDYFILE=/etc/caddy/Caddyfile

if grep -q '@html path / /index.html' "$CADDYFILE"; then
  echo "Already patched, nothing to do."
  exit 0
fi

BACKUP="${CADDYFILE}.$(date +%Y%m%d-%H%M%S).bak"
cp "$CADDYFILE" "$BACKUP"
echo "Backup: $BACKUP"

python3 - "$CADDYFILE" <<'PY'
import sys

path = sys.argv[1]
with open(path, encoding='utf-8') as f:
    lines = f.readlines()

block = [
    '\n',
    '    @html path / /index.html\n',
    '    header @html Cache-Control "no-store, must-revalidate"\n',
    '\n',
    '    @chunks path /chunks/*\n',
    '    header @chunks Cache-Control "public, max-age=31536000, immutable"\n',
]

for i, line in enumerate(lines):
    if line.strip().startswith('ggzpays.online') and line.rstrip().endswith('{'):
        lines[i + 1:i + 1] = block
        break
else:
    sys.exit("ERROR: 'ggzpays.online {' block not found")

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Directives inserted.")
PY

echo "Validating..."
caddy validate --config "$CADDYFILE"

echo "Reloading..."
systemctl reload caddy

echo
echo "--- Result ---"
curl -sI https://ggzpays.online/ | grep -i '^cache-control' || echo "WARNING: no cache-control header returned"
