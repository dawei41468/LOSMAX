#!/bin/bash

# This script deploys the frontend application to the Tencent Lighthouse server.

# Server details
SERVER_USER="root"
SERVER_IP="111.230.109.143"
REMOTE_BASE_DIR="/root/LOSMAX" # Base directory on the server where the project will reside
REMOTE_FRONTEND_DIR="${REMOTE_BASE_DIR}/frontend"
REMOTE_WEB_ROOT="/usr/share/nginx/html" # Base Nginx web root
REMOTE_LOSMAX_FRONTEND_DIR="${REMOTE_WEB_ROOT}/losmax" # Dedicated directory for LOSMAX frontend

echo "Creating tar archive of frontend (excluding node_modules)..."
# Create a tar archive of the frontend directory, excluding node_modules
tar --exclude='frontend/node_modules' -czf frontend.tar.gz frontend

if [ $? -ne 0 ]; then
  echo "Failed to create frontend tar archive. Exiting."
  exit 1
fi

echo "Copying frontend.tar.gz to ${SERVER_USER}@${SERVER_IP}:${REMOTE_BASE_DIR}/..."
# Copy the tar archive to your Tencent Lighthouse server
scp -i ~/.ssh/id_rsa frontend.tar.gz ${SERVER_USER}@${SERVER_IP}:${REMOTE_BASE_DIR}/

if [ $? -ne 0 ]; then
  echo "Failed to copy frontend.tar.gz. Exiting."
  exit 1
fi

echo "Cleaning up local tar archive..."
rm frontend.tar.gz

echo "Connecting to ${SERVER_USER}@${SERVER_IP} and deploying frontend..."

ssh -i ~/.ssh/id_rsa ${SERVER_USER}@${SERVER_IP} << EOF
  echo "Navigating to base project directory..."
  cd ${REMOTE_BASE_DIR}

  echo "Removing existing frontend directory on server..."
  rm -rf frontend

  echo "Creating new frontend directory..."
  mkdir -p frontend

  echo "Extracting frontend.tar.gz..."
  tar -xzf frontend.tar.gz -C frontend --strip-components=1

  echo "Removing frontend.tar.gz on server..."
  rm frontend.tar.gz

  echo "Navigating to frontend directory..."
  cd frontend

  echo "Updating npm on server..."
  npm install -g npm@latest

  echo "Installing frontend dependencies..."
  npm install

  echo "Building frontend for production..."
  npm run build -- --mode production

  if [ \$? -ne 0 ]; then
    echo "Frontend build failed on server."
  else
    echo "Copying built frontend assets to Nginx web root for LOSMAX..."
    mkdir -p ${REMOTE_LOSMAX_FRONTEND_DIR}
    cp -r dist/* ${REMOTE_LOSMAX_FRONTEND_DIR}/
  fi

  echo "Cleaning up frontend.tar.gz on server..."
  rm -f ../frontend.tar.gz

  echo "Frontend deployment complete."
EOF

if [ $? -ne 0 ]; then
  echo "Deployment script failed on remote server. Exiting."
  exit 1
fi

echo "Frontend deployment script finished."