#!/bin/bash
set -euo pipefail

# =========================
# LOS backend deployment
# Target: Tencent Lighthouse (Hong Kong)
# =========================

# --- Server details (edit if IP/key change) ---
SERVER_USER="ubuntu"
SERVER_IP="124.156.174.180"
SSH_KEY="${HOME}/.ssh/id_ed25519_tencentHK"

# --- Remote paths ---
REMOTE_BASE_DIR="/home/ubuntu/LOS"
REMOTE_APP_DIR="${REMOTE_BASE_DIR}/backend"
REMOTE_ECOSYSTEM="${REMOTE_BASE_DIR}/ecosystem.config.js"

# --- Local paths ---
LOCAL_BACKEND_DIR="backend"
LOCAL_ECOSYSTEM_FILE="ecosystem.config.js"

echo "==> Ensuring remote base dir exists: ${REMOTE_BASE_DIR}"
ssh -i "${SSH_KEY}" "${SERVER_USER}@${SERVER_IP}" "mkdir -p '${REMOTE_BASE_DIR}'"

echo "==> Recreating remote backend dir: ${REMOTE_APP_DIR}"
ssh -i "${SSH_KEY}" "${SERVER_USER}@${SERVER_IP}" "rm -rf '${REMOTE_APP_DIR}' && mkdir -p '${REMOTE_APP_DIR}'"

echo "==> Copying backend code (excluding venv) via tar stream"
( cd "${LOCAL_BACKEND_DIR}" && tar --exclude=venv -czf - . ) \
| ssh -i "${SSH_KEY}" "${SERVER_USER}@${SERVER_IP}" "tar -xzf - -C '${REMOTE_APP_DIR}'"

echo "==> Uploading PM2 ecosystem file (always overwrite)"
scp -i "${SSH_KEY}" "${LOCAL_ECOSYSTEM_FILE}" "${SERVER_USER}@${SERVER_IP}:${REMOTE_ECOSYSTEM}"

echo "==> Provisioning & starting on remote host"
ssh -i "${SSH_KEY}" "${SERVER_USER}@${SERVER_IP}" << 'EOF'
set -euo pipefail

cd /home/ubuntu/LOS

echo "==> Ensuring venv tooling is installed"
sudo apt-get update -y
sudo apt-get install -y python3-venv python3-pip >/dev/null

echo "==> (Re)creating Python venv"
python3 -m venv backend/venv

echo "==> Upgrading pip"
./backend/venv/bin/pip install --upgrade pip >/dev/null

echo "==> Installing backend requirements"
./backend/venv/bin/pip install --index-url https://pypi.org/simple/ -r backend/requirements.txt

# Make sure gunicorn/uvicorn are present
./backend/venv/bin/python - <<PY
import sys
missing=[]
for p in ("gunicorn","uvicorn"):
    try: __import__(p)
    except Exception: missing.append(p)
if missing:
    print("Installing:", ", ".join(missing))
    sys.exit(1)
PY
if [ $? -ne 0 ]; then
  ./backend/venv/bin/pip install gunicorn uvicorn
fi

echo "==> Clean restart PM2 app"
pm2 stop los-backend || true
pm2 delete los-backend || true
pm2 start ecosystem.config.js

echo "==> Save PM2 list for reboot"
pm2 save

EOF

echo "✅ Deployment complete."
