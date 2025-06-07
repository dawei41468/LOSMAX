#!/bin/bash

# This script deploys the backend application to the Tencent Lighthouse server.
# For the first deployment, this script will copy the entire backend directory to the server.

# Server details
SERVER_USER="root"
SERVER_IP="111.230.109.143"
REMOTE_BASE_DIR="/root/LOSMAX" # Base directory on the server where the project will reside
REMOTE_APP_DIR="${REMOTE_BASE_DIR}/backend"

echo "Copying backend code to ${SERVER_USER}@${SERVER_IP}:${REMOTE_BASE_DIR} (excluding venv)..."
# Ensure the base directory exists on the server
ssh -i ~/.ssh/id_rsa ${SERVER_USER}@${SERVER_IP} "mkdir -p ${REMOTE_BASE_DIR}"

# Remove existing backend directory on server to ensure a clean copy
ssh -i ~/.ssh/id_rsa ${SERVER_USER}@${SERVER_IP} "rm -rf ${REMOTE_APP_DIR}"

# Create the target backend directory on the server
ssh -i ~/.ssh/id_rsa ${SERVER_USER}@${SERVER_IP} "mkdir -p ${REMOTE_APP_DIR}"

# Create a tar archive of the backend directory, excluding venv, and extract it on the server
(cd backend && tar --exclude=venv -czf - .) | ssh -i ~/.ssh/id_rsa ${SERVER_USER}@${SERVER_IP} "tar -xzf - -C ${REMOTE_APP_DIR}"

if [ $? -ne 0 ]; then
  echo "Failed to copy backend code. Exiting."
  exit 1
fi

echo "Copying ecosystem.config.js to server..."
scp -i ~/.ssh/id_rsa ecosystem.config.js ${SERVER_USER}@${SERVER_IP}:${REMOTE_BASE_DIR}/ecosystem.config.js

echo "Connecting to ${SERVER_USER}@${SERVER_IP} and deploying backend..."

ssh -i ~/.ssh/id_rsa ${SERVER_USER}@${SERVER_IP} << EOF
  echo "Navigating to project directory..."
  cd ${REMOTE_BASE_DIR}

  echo "Creating virtual environment in backend..."
  python3 -m venv backend/venv

  echo "Upgrading pip within the virtual environment..."
  ./backend/venv/bin/pip install --upgrade pip

  echo "Installing backend dependencies into virtual environment from official PyPI..."
  ./backend/venv/bin/pip install --index-url https://pypi.org/simple/ -r backend/requirements.txt

  echo "Stopping existing backend process (if running)..."
  pm2 stop losmax-backend || true
  pm2 delete losmax-backend || true

  echo "Starting backend application with pm2 using ecosystem file..."
  pm2 start ecosystem.config.js

  echo "Saving pm2 process list..."
  pm2 save

  echo "Backend deployment complete."
EOF

echo "Deployment script finished."