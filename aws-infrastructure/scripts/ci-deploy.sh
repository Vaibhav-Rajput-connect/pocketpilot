#!/bin/bash

# PocketPilot CI/CD Deployment Script
# This script runs directly on the EC2 instance via AWS SSM

set -e

APP_DIR="/opt/pocketpilot"
AWS_REGION="us-east-1"
ECR_REPO="486243787764.dkr.ecr.us-east-1.amazonaws.com/pocketpilot-backend-prod"

echo "======================================"
echo "🚀 Starting Automated CI Deployment..."
echo "======================================"

# Navigate to app directory
cd $APP_DIR

# 1. Authenticate with ECR
echo "🔐 Authenticating with ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO

# 2. Tag existing image as backup for Rollback
echo "💾 Backing up current running image for potential rollback..."
# Get the current image ID of the running backend container
CURRENT_IMAGE_ID=$(docker images -q $ECR_REPO:latest || echo "")
if [ -n "$CURRENT_IMAGE_ID" ]; then
    docker tag $CURRENT_IMAGE_ID $ECR_REPO:rollback-backup
    echo "Backup tag created successfully."
else
    echo "No existing image found. Skipping backup."
fi

# 3. Pull latest image
echo "⬇️ Pulling latest Docker image..."
docker pull $ECR_REPO:latest

# 4. Restart containers
echo "🔄 Restarting PocketPilot Backend..."
docker compose -f docker-compose.prod.yml up -d --build backend nginx

# 5. Health Check Validation
echo "🩺 Performing Health Check..."
MAX_RETRIES=12
RETRY_COUNT=0
HEALTHY=false

# Wait for container to start (up to 60 seconds)
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "Checking health... (Attempt $((RETRY_COUNT+1))/$MAX_RETRIES)"
    
    # Check if Nginx (port 80) is returning a 200 OK
    STATUS_CODE=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost/health || echo "000")
    
    if [ "$STATUS_CODE" -eq 200 ]; then
        echo "✅ Health check PASSED! Deployment successful."
        HEALTHY=true
        break
    fi
    
    sleep 5
    RETRY_COUNT=$((RETRY_COUNT+1))
done

# 6. Automated Rollback Trigger
if [ "$HEALTHY" = false ]; then
    echo "❌ CRITICAL: Health check FAILED after 60 seconds."
    echo "⚠️ INITIATING EMERGENCY ROLLBACK..."
    
    if docker image inspect $ECR_REPO:rollback-backup >/dev/null 2>&1; then
        echo "Restoring previous working image..."
        # Tag the backup back to latest
        docker tag $ECR_REPO:rollback-backup $ECR_REPO:latest
        
        echo "Restarting containers with previous image..."
        docker compose -f docker-compose.prod.yml up -d backend nginx
        
        echo "✅ Rollback complete. Application restored to previous state."
        exit 1 # Fail the CI pipeline so developers know
    else
        echo "❌ FATAL: No rollback backup found! Manual intervention required."
        exit 1
    fi
fi

# Cleanup old images to save disk space
echo "🧹 Cleaning up unused Docker images..."
docker image prune -f

echo "🎉 Deployment Process Completed Successfully!"
