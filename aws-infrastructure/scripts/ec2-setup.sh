#!/bin/bash
set -e

# Redirect output to log file
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "Starting EC2 User-Data Setup Script for PocketPilot"

# 1. System Updates and Dependencies
dnf update -y
dnf install -y docker jq aws-cli

# 2. Start and Enable Docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# 3. Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. Fetch Secrets from AWS Secrets Manager
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
REGION=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/region)
if [ -z "$REGION" ]; then
  REGION="us-east-1"
fi
# Assume the environment is injected or we parse it. For now, hardcode 'prod'
ENV="prod"
SECRET_ID="pocketpilot-secrets-${ENV}"

echo "Fetching secrets from Secrets Manager ($SECRET_ID) in $REGION..."
SECRETS_JSON=$(aws secretsmanager get-secret-value --secret-id $SECRET_ID --region $REGION --query SecretString --output text)

# Extract secrets (requires jq)
export JWT_SECRET_KEY=$(echo $SECRETS_JSON | jq -r .JWT_SECRET_KEY)
export GEMINI_API_KEY=$(echo $SECRETS_JSON | jq -r .GEMINI_API_KEY)
# We will inject these into a .env file
mkdir -p /opt/pocketpilot
cat <<EOF > /opt/pocketpilot/.env
JWT_SECRET_KEY=$JWT_SECRET_KEY
GEMINI_API_KEY=$GEMINI_API_KEY
ENVIRONMENT=$ENV
DATABASE_URL=postgresql://pocketpilot_admin:rzFms:tQp.cqH.q.u4J8H38E-Dsf@pocketpilot-db-prod.c0lgyimmap1h.us-east-1.rds.amazonaws.com:5432/pocketpilot
REDIS_URL=redis://master.pocketpilot-redis-prod.cpjkvq.use1.cache.amazonaws.com:6379/0
EOF

# 5. Fetch Database URL from SSM or constructed if RDS is managed elsewhere
# In a real scenario, Terraform would inject the RDS endpoint and Redis endpoint into SSM or the user-data script directly via templatefile().
# For demonstration, we assume they are added to the .env file.

# 6. Pull and Run Docker Containers
cd /opt/pocketpilot

# We would typically pull the docker-compose.prod.yml from S3 or Git
# Example: aws s3 cp s3://my-bucket/docker-compose.prod.yml .

# Then pull images (assuming ECR authentication)
# aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.$REGION.amazonaws.com
# docker-compose pull

# Start services
# docker-compose -f docker-compose.prod.yml up -d

echo "EC2 Setup Completed Successfully!"
