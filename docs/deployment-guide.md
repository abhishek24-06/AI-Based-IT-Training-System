# AI-Based IT Training System Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Monitoring Setup](#monitoring-setup)
6. [Backup Configuration](#backup-configuration)
7. [Security Configuration](#security-configuration)
8. [Scaling](#scaling)

## Prerequisites

### Required Services
- AWS Account
- PostgreSQL Database
- Redis Cache
- S3 Bucket
- CloudFront Distribution
- Route 53 Domain

### Required Tools
- AWS CLI
- Docker
- kubectl
- Helm
- Terraform

## Infrastructure Setup

### AWS Infrastructure
1. Create VPC
```bash
aws ec2 create-vpc --cidr-block 10.0.0.0/16
```

2. Create Subnets
```bash
# Public subnet
aws ec2 create-subnet --vpc-id vpc-xxxx --cidr-block 10.0.1.0/24

# Private subnet
aws ec2 create-subnet --vpc-id vpc-xxxx --cidr-block 10.0.2.0/24
```

3. Create Security Groups
```bash
# Application security group
aws ec2 create-security-group --group-name app-sg --description "Application Security Group"

# Database security group
aws ec2 create-security-group --group-name db-sg --description "Database Security Group"
```

### Kubernetes Cluster
1. Create EKS Cluster
```bash
eksctl create cluster \
  --name training-system \
  --region us-east-1 \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 5
```

2. Configure kubectl
```bash
aws eks update-kubeconfig --name training-system --region us-east-1
```

## Database Setup

### PostgreSQL Setup
1. Create RDS Instance
```bash
aws rds create-db-instance \
  --db-instance-identifier training-system-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --master-user-password your-password \
  --allocated-storage 20
```

2. Run Migrations
```bash
# Set up database URL
export DATABASE_URL=postgres://admin:your-password@your-rds-endpoint:5432/training_system

# Run migrations
cd backend
npm run migration:run
```

### Redis Setup
1. Create ElastiCache Cluster
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id training-system-cache \
  --cache-node-type cache.t3.medium \
  --engine redis \
  --num-cache-nodes 1
```

## Application Deployment

### Docker Images
1. Build Images
```bash
# Build backend image
docker build -t training-system-backend:latest ./backend

# Build frontend image
docker build -t training-system-frontend:latest ./frontend
```

2. Push to ECR
```bash
# Create repository
aws ecr create-repository --repository-name training-system-backend
aws ecr create-repository --repository-name training-system-frontend

# Push images
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/training-system-backend:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/training-system-frontend:latest
```

### Kubernetes Deployment
1. Create Namespace
```bash
kubectl create namespace training-system
```

2. Deploy Backend
```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
```

3. Deploy Frontend
```bash
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

## Monitoring Setup

### New Relic Setup
1. Install New Relic Agent
```bash
helm repo add newrelic https://helm-charts.newrelic.com
helm install newrelic newrelic/nri-bundle \
  --set global.licenseKey=your-license-key \
  --set global.cluster=training-system
```

2. Configure Alerts
- Set up alert policies
- Configure notification channels
- Define alert conditions

### Logging Setup
1. Install Fluentd
```bash
helm repo add fluent https://fluent.github.io/helm-charts
helm install fluentd fluent/fluentd
```

2. Configure Log Aggregation
- Set up log retention
- Configure log parsing
- Set up log alerts

## Backup Configuration

### Database Backups
1. Configure RDS Backups
```bash
aws rds modify-db-instance \
  --db-instance-identifier training-system-db \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00"
```

2. Set up S3 Backup
```bash
# Create backup bucket
aws s3api create-bucket --bucket training-system-backups

# Configure lifecycle rules
aws s3api put-bucket-lifecycle-configuration \
  --bucket training-system-backups \
  --lifecycle-configuration file://backup-lifecycle.json
```

### Application Backups
1. Configure EBS Snapshots
```bash
aws ec2 create-snapshot \
  --volume-id vol-xxxx \
  --description "Training System Backup"
```

2. Set up Backup Schedule
```bash
# Create backup policy
aws backup create-backup-plan \
  --backup-plan file://backup-plan.json
```

## Security Configuration

### SSL/TLS Setup
1. Request Certificate
```bash
aws acm request-certificate \
  --domain-name training-system.com \
  --validation-method DNS
```

2. Configure CloudFront
```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### Security Groups
1. Configure Ingress Rules
```bash
# Allow HTTP/HTTPS
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxx \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

## Scaling

### Horizontal Scaling
1. Configure Auto Scaling
```bash
# Create auto scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name training-system-asg \
  --launch-configuration-name training-system-lc \
  --min-size 3 \
  --max-size 10 \
  --desired-capacity 3
```

2. Set up Scaling Policies
```bash
# Create scaling policy
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name training-system-asg \
  --policy-name cpu-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration file://scaling-config.json
```

### Vertical Scaling
1. Monitor Performance
- CPU usage
- Memory usage
- Disk I/O
- Network throughput

2. Adjust Resources
```bash
# Modify instance type
aws ec2 modify-instance-attribute \
  --instance-id i-xxxx \
  --instance-type t3.large
``` 