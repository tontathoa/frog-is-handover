#!/bin/bash
# Production deploy — runs ON THE SERVER, from the app folder:  bash deploy.sh
# Pulls main, installs dependencies, rebuilds and reloads the PM2 process.
# Not touched: .env.local, the database, and files uploaded through the admin (untracked in public/uploads/).
set -e

# Make the nvm-installed node toolchain (node/npm/pm2) available in
# non-interactive SSH shells, where ~/.bashrc / nvm are not sourced.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1

APP_PATH="${APP_PATH:-/var/www/frogis}"
PM2_NAME="${PM2_NAME:-frogis-web}"
cd "$APP_PATH"

echo "[Deploy] Pulling latest code..."
git pull --ff-only origin main

echo "[Deploy] Installing dependencies..."
npm ci

# Apply schema changes (idempotent) before the build reads the database.
echo "[Deploy] Updating the database schema..."
npm run -s db:setup

# Public pages are pre-rendered from the database, so it must be reachable here.
echo "[Deploy] Building..."
npm run build

echo "[Deploy] (re)starting PM2 process '$PM2_NAME'..."
pm2 startOrReload ecosystem.config.js --only "$PM2_NAME" --update-env
pm2 save >/dev/null 2>&1 || true

echo "[Deploy] Done at $(date)"
