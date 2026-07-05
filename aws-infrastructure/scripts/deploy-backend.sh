#!/bin/bash
set -e

# Deployment Script for PocketPilot Backend
# This script builds the Docker image, pushes it to ECR, and triggers an ASG Instance Refresh.

AWS_REGION="us-east-1"
ENV="prod"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/pocketpilot-backend-${ENV}"
ASG_NAME="pocketpilot-asg-${ENV}"

echo "🚀 Starting Deployment for PocketPilot Backend ($ENV)"

# 1. Authenticate with ECR
echo "🔐 Authenticating with AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO

# 2. Build Docker Image
echo "🔨 Building Docker Image..."
docker build -t pocketpilot-backend:latest -f ../../backend/Dockerfile ../../backend

# 3. Tag and Push to ECR
echo "🏷️ Tagging and Pushing to ECR..."
docker tag pocketpilot-backend:latest ${ECR_REPO}:latest
docker push ${ECR_REPO}:latest

# 4. Trigger ASG Instance Refresh (Zero-downtime rolling update)
echo "🔄 Triggering ASG Instance Refresh..."
REFRESH_ID=$(aws autoscaling start-instance-refresh \
  --auto-scaling-group-name $ASG_NAME \
  --preferences '{"MinHealthyPercentage": 50, "InstanceWarmup": 300}' \
  --query 'InstanceRefreshId' \
  --output text)

echo "✅ Deployment initiated! Instance Refresh ID: $REFRESH_ID"
echo "You can monitor the progress via the AWS Console or CLI."
