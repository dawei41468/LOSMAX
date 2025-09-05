#!/bin/bash
set -euo pipefail

# =========================
# LOS frontend deployment
# =========================

# --- Server details ---
SERVER_USER="ubuntu"
SERVER_IP="124.156.174.180"
SSH_KEY="${HOME}/.ssh/id_ed25519_tencentHK"

# --- Remote paths ---
REMOTE_BASE_DIR="/home/ubuntu/LOS"
REMOTE_FRONTEND_DIR="${REMOTE_BASE_DIR}/frontend"
REMOTE_WEB_ROOT="/var/www/los-frontend"

# --- Local paths ---
LOCAL_FRONTEND_DIR="frontend"
BUNDLE="frontend.tar.gz"

echo "==> Creating tar archive of frontend (excluding node_modules)"
tar --exclude="${LOCAL_FRONTEND_DIR}/node_modules" -czf "${BUNDLE}" "${LOCAL_FRONTEND_DIR}"

echo "==> Copying ${BUNDLE} to ${SERVER_USER}@${SERVER_IP}:${REMOTE_BASE_DIR}/"
scp -i "${SSH_KEY}" "${BUNDLE}" "${SERVER_USER}@${SERVER_IP}:${REMOTE_BASE_DIR}/"

echo "==> Cleaning up local tar"
rm -f "${BUNDLE}"

echo "==> Deploying on remote host"
ssh -i "${SSH_KEY}" "${SERVER_USER}@${SERVER_IP}" <<'EOF'
set -euo pipefail

REMOTE_BASE_DIR="/home/ubuntu/LOS"
REMOTE_FRONTEND_DIR="${REMOTE_BASE_DIR}/frontend"
REMOTE_WEB_ROOT="/var/www/los-frontend"
BUNDLE="${REMOTE_BASE_DIR}/frontend.tar.gz"

echo "==> Resetting remote frontend workspace"
rm -rf "${REMOTE_FRONTEND_DIR}"
mkdir -p "${REMOTE_FRONTEND_DIR}"

echo "==> Extracting bundle"
tar -xzf "${BUNDLE}" -C "${REMOTE_FRONTEND_DIR}" --strip-components=1 || true
rm -f "${BUNDLE}"

cd "${REMOTE_FRONTEND_DIR}"

echo "==> Installing frontend dependencies (prefer npm ci)"
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund --progress=false
else
  npm install --no-audit --no-fund --progress=false
fi

# If your build needs env vars (e.g., Vite):
# echo "VITE_API_BASE=/api" > .env.production

echo "==> Building frontend for production"
npm run build -- --mode production

echo "==> Publishing build to Nginx web root"
sudo mkdir -p "${REMOTE_WEB_ROOT}"
sudo rm -rf "${REMOTE_WEB_ROOT:?}/"*
sudo cp -r dist/* "${REMOTE_WEB_ROOT}/"

# Ownership: files readable by nginx (www-data)
sudo chown -R ubuntu:www-data "${REMOTE_WEB_ROOT}"
sudo find "${REMOTE_WEB_ROOT}" -type d -exec chmod 755 {} \;
sudo find "${REMOTE_WEB_ROOT}" -type f -exec chmod 644 {} \;

echo "==> Frontend deployed."
EOF

echo "✅ Frontend deployment script finished."
