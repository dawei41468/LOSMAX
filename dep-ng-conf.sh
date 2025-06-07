#!/bin/bash
# This script deploys the Nginx configuration to the server and reloads Nginx.

# Copy the updated Nginx configuration to the server
scp -i ~/.ssh/id_rsa losmax-nginx.conf root@111.230.109.143:/etc/nginx/conf.d/losmax.conf

# Reload the Nginx configuration on the server
ssh -i ~/.ssh/id_rsa root@111.230.109.143 "systemctl restart nginx"

echo "Nginx configuration deployed and reloaded successfully."