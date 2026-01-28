# AWS CLI Integration Guide

## Overview
This document explains how AWS CLI is integrated into this DevOps project for infrastructure management, CI/CD automation, and deployment processes.

## Table of Contents
1. [AWS CLI Setup](#aws-cli-setup)
2. [AWS CLI with Terraform](#aws-cli-with-terraform)
3. [AWS CLI with Jenkins](#aws-cli-with-jenkins)
4. [AWS CLI with Ansible](#aws-cli-with-ansible)
5. [Common AWS CLI Commands](#common-aws-cli-commands)
6. [Integration Architecture](#integration-architecture)

---

## AWS CLI Setup

### Installation
```bash
# Windows (using MSI installer or pip)
pip install awscli

# Linux/Mac
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Configuration
```bash
# Configure AWS credentials
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### Verify Installation
```bash
aws --version
aws sts get-caller-identity
```

---

## AWS CLI with Terraform

### Use Cases
AWS CLI complements Terraform by:
- Validating AWS credentials before Terraform runs
- Retrieving AWS account information
- Managing S3 backend for Terraform state
- Cleaning up resources that Terraform can't manage
- Debugging infrastructure issues

### Pre-Terraform Validation
```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check if S3 bucket exists for Terraform state
aws s3 ls s3://terraform-state-bucket-taskmanager

# Create S3 bucket for Terraform backend
aws s3 mb s3://terraform-state-bucket-taskmanager --region us-east-1

# Enable versioning on state bucket
aws s3api put-bucket-versioning \
  --bucket terraform-state-bucket-taskmanager \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

### Retrieve Infrastructure Information
```bash
# Get VPC information for Terraform variables
aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" \
  --query 'Vpcs[0].VpcId' --output text

# Get subnet IDs
aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=vpc-xxxxx" \
  --query 'Subnets[*].SubnetId' --output text

# Get latest AMI ID for EC2 instances
aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=amzn2-ami-hvm-*-x86_64-gp2" \
  --query 'sort_by(Images, &CreationDate)[-1].ImageId' \
  --output text
```

### Post-Terraform Resource Verification
```bash
# Verify EC2 instances created by Terraform
aws ec2 describe-instances \
  --filters "Name=tag:ManagedBy,Values=Terraform" \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]' \
  --output table

# Check security groups
aws ec2 describe-security-groups \
  --filters "Name=tag:Project,Values=TaskManager" \
  --output table
```

---

## AWS CLI with Jenkins

### Use Cases in CI/CD Pipeline
- Build and push Docker images to ECR
- Deploy applications to ECS/EKS
- Update CloudFront distributions
- Invalidate CDN caches
- Deploy to S3 for static sites
- Parameter Store/Secrets Manager integration

### ECR (Elastic Container Registry) Integration

#### Login to ECR
```bash
# Get ECR login password and login to Docker
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.us-east-1.amazonaws.com
```

#### Create ECR Repositories
```bash
# Create repository for backend
aws ecr create-repository \
  --repository-name taskmanager/backend \
  --region us-east-1 \
  --image-scanning-configuration scanOnPush=true

# Create repository for frontend
aws ecr create-repository \
  --repository-name taskmanager/frontend \
  --region us-east-1 \
  --image-scanning-configuration scanOnPush=true
```

#### Tag and Push Docker Images
```bash
# Tag backend image
docker tag taskmanager-backend:latest \
  <aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/taskmanager/backend:latest

# Tag frontend image
docker tag taskmanager-frontend:latest \
  <aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/taskmanager/frontend:latest

# Push to ECR
docker push <aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/taskmanager/backend:latest
docker push <aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/taskmanager/frontend:latest
```

### ECS (Elastic Container Service) Deployment

#### Update ECS Service
```bash
# Force new deployment of ECS service
aws ecs update-service \
  --cluster taskmanager-cluster \
  --service taskmanager-service \
  --force-new-deployment \
  --region us-east-1

# Wait for service to stabilize
aws ecs wait services-stable \
  --cluster taskmanager-cluster \
  --services taskmanager-service \
  --region us-east-1
```

#### Register New Task Definition
```bash
# Register updated task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region us-east-1

# Update service with new task definition
aws ecs update-service \
  --cluster taskmanager-cluster \
  --service taskmanager-service \
  --task-definition taskmanager:latest \
  --region us-east-1
```

### S3 Deployment for Frontend Static Files
```bash
# Sync frontend build to S3
aws s3 sync ./frontend/dist s3://taskmanager-frontend-bucket \
  --delete \
  --cache-control "max-age=31536000,public"

# Update index.html with no cache
aws s3 cp ./frontend/dist/index.html s3://taskmanager-frontend-bucket/index.html \
  --cache-control "max-age=0,no-cache,no-store,must-revalidate"

# Create CloudFront invalidation
aws cloudfront create-invalidation \
  --distribution-id E1XXXXXXXXXXXXX \
  --paths "/*"
```

### Secrets Manager Integration
```bash
# Retrieve database credentials
DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id taskmanager/db/password \
  --query SecretString \
  --output text)

# Retrieve API keys
API_KEY=$(aws secretsmanager get-secret-value \
  --secret-id taskmanager/api/key \
  --query SecretString \
  --output text)

# Use in environment variables
export DATABASE_PASSWORD=$DB_PASSWORD
export API_KEY=$API_KEY
```

### Jenkins Pipeline Integration Example
```groovy
// In Jenkinsfile
stage('AWS ECR Login') {
    steps {
        sh '''
            aws ecr get-login-password --region us-east-1 | \
            docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com
        '''
    }
}

stage('Build and Push to ECR') {
    steps {
        sh '''
            docker build -t taskmanager/backend ./backend
            docker tag taskmanager/backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/taskmanager/backend:${BUILD_NUMBER}
            docker push ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/taskmanager/backend:${BUILD_NUMBER}
        '''
    }
}

stage('Deploy to ECS') {
    steps {
        sh '''
            aws ecs update-service \
                --cluster taskmanager-cluster \
                --service taskmanager-service \
                --force-new-deployment \
                --region us-east-1
        '''
    }
}
```

---

## AWS CLI with Ansible

### Use Cases
- Dynamic inventory from EC2 instances
- Retrieve secrets before configuration
- Validate AWS resources before deployment
- Update Route53 DNS records
- Manage S3 buckets for application data

### Dynamic Inventory
```bash
# Generate EC2 dynamic inventory
aws ec2 describe-instances \
  --filters "Name=tag:Environment,Values=production" \
  --query 'Reservations[*].Instances[*].[PublicIpAddress,Tags[?Key==`Name`].Value|[0]]' \
  --output text > inventory.ini
```

### Pre-Deployment Checks
```bash
# Verify target EC2 instances are running
aws ec2 describe-instances \
  --instance-ids i-xxxxxxxxxxxxx \
  --query 'Reservations[*].Instances[*].State.Name' \
  --output text

# Check security group rules
aws ec2 describe-security-groups \
  --group-ids sg-xxxxxxxxxxxxx \
  --query 'SecurityGroups[*].IpPermissions[*].[FromPort,ToPort,IpProtocol]' \
  --output table
```

### Retrieve Configuration from Parameter Store
```bash
# Get database endpoint
DB_ENDPOINT=$(aws ssm get-parameter \
  --name /taskmanager/database/endpoint \
  --query Parameter.Value \
  --output text)

# Get application config
APP_CONFIG=$(aws ssm get-parameter \
  --name /taskmanager/app/config \
  --with-decryption \
  --query Parameter.Value \
  --output text)
```

### Ansible Playbook Integration
```yaml
# In deploy.yml
- name: Get RDS endpoint from AWS
  shell: |
    aws rds describe-db-instances \
      --db-instance-identifier taskmanager-db \
      --query 'DBInstances[0].Endpoint.Address' \
      --output text
  register: db_endpoint
  delegate_to: localhost

- name: Get secrets from Secrets Manager
  shell: |
    aws secretsmanager get-secret-value \
      --secret-id taskmanager/app/secrets \
      --query SecretString \
      --output text
  register: app_secrets
  delegate_to: localhost

- name: Deploy application with AWS values
  template:
    src: application.properties.j2
    dest: /opt/app/application.properties
  vars:
    database_host: "{{ db_endpoint.stdout }}"
    secrets: "{{ app_secrets.stdout | from_json }}"
```

### Update Route53 DNS Records
```bash
# Update DNS record after deployment
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1XXXXXXXXXXXXX \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "api.taskmanager.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "'$EC2_PUBLIC_IP'"}]
      }
    }]
  }'
```

---

## Common AWS CLI Commands

### EC2 Management
```bash
# List all running instances
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --output table

# Start instances
aws ec2 start-instances --instance-ids i-xxxxxxxxxxxxx

# Stop instances
aws ec2 stop-instances --instance-ids i-xxxxxxxxxxxxx

# Create AMI from instance
aws ec2 create-image \
  --instance-id i-xxxxxxxxxxxxx \
  --name "taskmanager-backup-$(date +%Y%m%d)" \
  --description "TaskManager application backup"

# Get instance public IP
aws ec2 describe-instances \
  --instance-ids i-xxxxxxxxxxxxx \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

### RDS (Database) Management
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier taskmanager-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password YourPassword123! \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxxxxxx

# Get RDS endpoint
aws rds describe-db-instances \
  --db-instance-identifier taskmanager-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text

# Create database snapshot
aws rds create-db-snapshot \
  --db-instance-identifier taskmanager-db \
  --db-snapshot-identifier taskmanager-snapshot-$(date +%Y%m%d)

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier taskmanager-db-restored \
  --db-snapshot-identifier taskmanager-snapshot-20260126
```

### Load Balancer Management
```bash
# Describe load balancers
aws elbv2 describe-load-balancers \
  --names taskmanager-alb

# Describe target health
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:region:account-id:targetgroup/name/id

# Register targets
aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:region:account-id:targetgroup/name/id \
  --targets Id=i-xxxxxxxxxxxxx
```

### CloudWatch Logs and Monitoring
```bash
# Get recent logs
aws logs tail /aws/ecs/taskmanager --follow

# Create log group
aws logs create-log-group \
  --log-group-name /taskmanager/application

# Put metric data
aws cloudwatch put-metric-data \
  --namespace TaskManager \
  --metric-name DeploymentCount \
  --value 1 \
  --timestamp $(date -u +%Y-%m-%dT%H:%M:%S)

# Get metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=taskmanager-service \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

### IAM Management
```bash
# Create IAM role for EC2
aws iam create-role \
  --role-name TaskManagerEC2Role \
  --assume-role-policy-document file://trust-policy.json

# Attach policy to role
aws iam attach-role-policy \
  --role-name TaskManagerEC2Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly

# Create instance profile
aws iam create-instance-profile \
  --instance-profile-name TaskManagerEC2Profile

# Add role to instance profile
aws iam add-role-to-instance-profile \
  --instance-profile-name TaskManagerEC2Profile \
  --role-name TaskManagerEC2Role
```

---

## Integration Architecture

### Complete CI/CD Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Developer Workflow                       │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ├─ git push
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Jenkins Pipeline                            │
│                                                                  │
│  1. Checkout Code                                               │
│  2. AWS CLI: Validate credentials                               │
│     aws sts get-caller-identity                                 │
│                                                                  │
│  3. AWS CLI: Login to ECR                                       │
│     aws ecr get-login-password | docker login                   │
│                                                                  │
│  4. Build Docker Images                                         │
│     docker build -t backend ./backend                           │
│     docker build -t frontend ./frontend                         │
│                                                                  │
│  5. AWS CLI: Push to ECR                                        │
│     docker push <ecr-url>/backend:tag                           │
│     docker push <ecr-url>/frontend:tag                          │
│                                                                  │
│  6. AWS CLI: Get secrets                                        │
│     aws secretsmanager get-secret-value                         │
│                                                                  │
│  7. Trigger Terraform (if infrastructure changes)               │
│     aws s3 cp terraform.tfstate s3://state-bucket               │
│                                                                  │
│  8. Trigger Ansible Deployment                                  │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Terraform Execution                          │
│                                                                  │
│  1. AWS CLI: Setup S3 backend                                   │
│     aws s3 mb s3://terraform-state                              │
│                                                                  │
│  2. AWS CLI: Get VPC/Subnet info                                │
│     aws ec2 describe-vpcs                                       │
│                                                                  │
│  3. terraform init/plan/apply                                   │
│     - Creates EC2, RDS, ALB, Security Groups                    │
│                                                                  │
│  4. AWS CLI: Verify resources                                   │
│     aws ec2 describe-instances                                  │
│     aws rds describe-db-instances                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Ansible Deployment                           │
│                                                                  │
│  1. AWS CLI: Get dynamic inventory                              │
│     aws ec2 describe-instances --filters > inventory            │
│                                                                  │
│  2. AWS CLI: Get RDS endpoint                                   │
│     aws rds describe-db-instances --query Endpoint              │
│                                                                  │
│  3. AWS CLI: Get application secrets                            │
│     aws secretsmanager get-secret-value                         │
│                                                                  │
│  4. ansible-playbook deploy.yml                                 │
│     - Configure EC2 instances                                   │
│     - Pull Docker images from ECR                               │
│     - Deploy containers                                         │
│     - Configure nginx                                           │
│                                                                  │
│  5. AWS CLI: Update Route53                                     │
│     aws route53 change-resource-record-sets                     │
│                                                                  │
│  6. AWS CLI: Create CloudFront invalidation                     │
│     aws cloudfront create-invalidation                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Post-Deployment                              │
│                                                                  │
│  1. AWS CLI: Health checks                                      │
│     aws elbv2 describe-target-health                            │
│                                                                  │
│  2. AWS CLI: Monitor logs                                       │
│     aws logs tail /taskmanager/app --follow                     │
│                                                                  │
│  3. AWS CLI: Send metrics                                       │
│     aws cloudwatch put-metric-data                              │
└─────────────────────────────────────────────────────────────────┘
```

### Key Integration Points

#### 1. Jenkins → AWS CLI → ECR
- Authenticate with ECR
- Build and push container images
- Manage image lifecycle

#### 2. Terraform → AWS CLI
- Validate credentials
- Manage remote state in S3
- Query existing resources
- Verify created infrastructure

#### 3. Ansible → AWS CLI
- Dynamic inventory from EC2
- Retrieve secrets and parameters
- Update DNS records
- Verify deployment

---

## Best Practices

### 1. Security
```bash
# Never hardcode credentials
# Use IAM roles for EC2/ECS
# Use environment variables or AWS profiles
aws configure --profile taskmanager

# Use specific profiles
aws s3 ls --profile taskmanager

# Enable MFA for sensitive operations
aws s3 rm s3://bucket --mfa "arn:aws:iam::account:mfa/user 123456"
```

### 2. Error Handling
```bash
# Check command success
if aws s3 ls s3://bucket-name; then
    echo "Bucket exists"
else
    echo "Creating bucket"
    aws s3 mb s3://bucket-name
fi

# Use --no-cli-pager for scripts
export AWS_PAGER=""
```

### 3. Output Formatting
```bash
# Use --query for specific data
aws ec2 describe-instances \
  --query 'Reservations[*].Instances[*].[InstanceId,PublicIpAddress]'

# Use --output for different formats
aws ec2 describe-instances --output json
aws ec2 describe-instances --output table
aws ec2 describe-instances --output text
```

### 4. Debugging
```bash
# Enable debug mode
aws ec2 describe-instances --debug

# Dry run (for supported commands)
aws ec2 run-instances --dry-run ...
```

---

## Implementation Checklist

- [ ] Install AWS CLI on Jenkins server
- [ ] Configure AWS credentials in Jenkins
- [ ] Create ECR repositories for backend and frontend
- [ ] Create S3 bucket for Terraform state
- [ ] Create DynamoDB table for state locking
- [ ] Set up Secrets Manager for sensitive data
- [ ] Create IAM roles and policies
- [ ] Update Jenkinsfile with AWS CLI commands
- [ ] Update Terraform to use S3 backend
- [ ] Update Ansible playbook to use AWS CLI for dynamic inventory
- [ ] Test complete CI/CD pipeline
- [ ] Document AWS resource cleanup procedures

---

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
```bash
# Verify credentials
aws sts get-caller-identity

# Check configured profiles
aws configure list

# Set region
export AWS_DEFAULT_REGION=us-east-1
```

#### 2. Permission Errors
```bash
# Check IAM permissions
aws iam get-user
aws iam list-attached-user-policies --user-name username

# Test specific permission
aws ec2 describe-instances --dry-run
```

#### 3. Region Issues
```bash
# List available regions
aws ec2 describe-regions --output table

# Set default region
aws configure set region us-east-1
```

---

## Additional Resources

- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [AWS CLI Command Reference](https://awscli.amazonaws.com/v2/documentation/api/latest/index.html)
- [Jenkins AWS Credentials Plugin](https://plugins.jenkins.io/aws-credentials/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Ansible AWS Modules](https://docs.ansible.com/ansible/latest/collections/amazon/aws/)

---

## Next Steps

1. **Review current infrastructure setup** in Terraform files
2. **Identify AWS resources** needed for TaskManager application
3. **Update Jenkinsfile** with ECR and ECS deployment steps
4. **Enhance Ansible playbook** with AWS CLI commands
5. **Test the complete pipeline** end-to-end
6. **Document actual AWS resources** created for this project
