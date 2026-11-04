#!/usr/bin/env bash
# Deploy the Next.js Outscalers site (outscalers-testing → :3004 / outscalers.com).
# Safe guarantees:
#  - Only touches /var/www/outscalers-testing and outscalers-testing.service
#  - Never restarts outscalers.service (old Nuxt on :3003)
#  - Restores the previous .next build if the new build or health check fails
#  - Preserves .env.production (gitignored)
set -euo pipefail

APP_DIR=/var/www/outscalers-testing
SERVICE=outscalers-testing.service
HEALTH_URL=http://127.0.0.1:3004/
OLD_SERVICE=outscalers.service

echo "=== Deploying Outscalers Next.js site ==="
echo "App dir: $APP_DIR"
echo "Service: $SERVICE (will NOT touch $OLD_SERVICE)"

cd "$APP_DIR"

if [[ ! -f .env.production ]]; then
  echo "ERROR: .env.production is missing — aborting to avoid a broken deploy."
  exit 1
fi

# Remember previous build for rollback
rm -rf .next.prev
if [[ -d .next ]]; then
  echo "Backing up current .next → .next.prev"
  cp -a .next .next.prev
fi

restore_previous() {
  echo "Restoring previous .next build..."
  rm -rf .next
  if [[ -d .next.prev ]]; then
    mv .next.prev .next
    chown -R www-data:www-data .next
  fi
}

# Dependencies — prefer npm ci; fall back to npm install if the lockfile is out of sync
echo "Installing dependencies..."
if [[ -f package-lock.json ]] && npm ci --prefer-offline; then
  echo "npm ci OK"
else
  echo "npm ci unavailable or lock out of sync — using npm install"
  npm install --prefer-offline
fi

echo "Building..."
if ! npm run build; then
  echo "ERROR: build failed"
  restore_previous
  exit 1
fi

chown -R www-data:www-data .next node_modules

echo "Restarting $SERVICE..."
systemctl restart "$SERVICE"
sleep 2

if ! systemctl is-active --quiet "$SERVICE"; then
  echo "ERROR: $SERVICE is not active after restart"
  restore_previous
  systemctl restart "$SERVICE" || true
  exit 1
fi

if ! curl -fsS --max-time 15 "$HEALTH_URL" >/dev/null; then
  echo "ERROR: health check failed for $HEALTH_URL"
  restore_previous
  systemctl restart "$SERVICE" || true
  exit 1
fi

rm -rf .next.prev
echo "=== Deployment complete ✅ ==="
echo "New site: https://outscalers.com/  (and http://127.0.0.1:3004/)"
echo "Old site untouched: $OLD_SERVICE on :3003"
systemctl is-active "$SERVICE" "$OLD_SERVICE" || true
