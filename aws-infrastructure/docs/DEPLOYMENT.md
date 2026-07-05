# PocketPilot Production Deployment Guide

This document contains instructions for deploying the PocketPilot AWS backend architecture and Vercel frontend.

## 1. Backend Infrastructure (Terraform)

### Prerequisites
- AWS CLI installed and configured (`aws configure`)
- Terraform CLI installed

### Deployment Steps
1. Navigate to the terraform directory:
   ```bash
   cd aws-infrastructure/terraform
   ```
2. Initialize Terraform (downloads AWS providers):
   ```bash
   terraform init
   ```
3. Plan the deployment to verify the resources that will be created:
   ```bash
   terraform plan -var="domain_name=api.pocketpilot.app" -out=tfplan
   ```
4. Apply the configuration to provision the entire architecture (VPC, RDS, ElastiCache, ALB, ASG):
   ```bash
   terraform apply tfplan
   ```
5. **Important:** After applying, you must configure your domain's DNS in Route53 or your domain registrar using the Nameservers (NS records) provided by the Route53 Hosted Zone output.

## 2. Secrets Management

Once the infrastructure is up, the Secrets Manager secret `pocketpilot-secrets-prod` will be created with dummy data.
You MUST update this secret via the AWS Console or CLI with real values before the backend will start correctly:
```bash
aws secretsmanager put-secret-value \
    --secret-id pocketpilot-secrets-prod \
    --secret-string '{"JWT_SECRET_KEY":"your-real-secret","GEMINI_API_KEY":"your-real-key"}'
```

## 3. Pushing the Backend Code

To deploy your backend code, use the provided deployment script. This script builds the docker image, pushes it to your Elastic Container Registry (ECR), and safely cycles the EC2 instances.

```bash
cd aws-infrastructure/scripts
chmod +x deploy-backend.sh
./deploy-backend.sh
```

## 4. Frontend Deployment (Vercel)

The frontend is deployed entirely on Vercel for maximum edge performance.

### Prerequisites
- Vercel CLI installed (`npm i -g vercel`)

### Deployment Steps
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Deploy the application:
   ```bash
   vercel --prod
   ```
3. During setup, configure the `NEXT_PUBLIC_API_URL` environment variable in Vercel to point to your new AWS Application Load Balancer DNS name (e.g., `https://api.pocketpilot.app`).

## Architecture Details

- **Database:** Amazon RDS (PostgreSQL 16) - Multi-AZ
- **Cache:** Amazon ElastiCache (Redis 7) - Multi-AZ
- **Compute:** Auto Scaling Group of EC2 instances pulling Docker images
- **Network:** Private subnets for compute/data, Public subnets for Application Load Balancers and NAT Gateways.
