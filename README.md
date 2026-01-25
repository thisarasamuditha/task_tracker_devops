# Task Tracker DevOps - Full Stack CI/CD Pipeline

> A production-ready DevOps implementation demonstrating automated deployment of a full-stack task management application using modern DevOps practices and tools.

**Author:** Thisara Samuditha

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://linkedin.com/in/thisarasamuditha)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black)](https://github.com/thisarasamuditha)

---

## Overview

This project showcases a complete end-to-end DevOps pipeline for deploying a full-stack task management application. It demonstrates industry-standard practices including Infrastructure as Code, containerization, automated CI/CD, and cloud deployment.

### Key Highlights

- Fully automated CI/CD pipeline with Jenkins
- Infrastructure provisioned using Terraform
- Configuration management with Ansible
- Containerized microservices architecture
- Managed database service (AWS RDS)
- Multi-stage Docker builds for optimization
- Zero-downtime deployment strategy

### Architecture

```
Developer → GitHub → Jenkins CI/CD → DockerHub → Ansible → AWS EC2
                                                              ↓
                                                         Application
                                                         (Frontend + Backend)
                                                              ↓
                                                         AWS RDS MySQL
```

**Application Stack:**
- Frontend: React 19 with Vite, served by Nginx
- Backend: Spring Boot 3.5.5 REST API
- Database: AWS RDS MySQL 8.0 (Managed Service)
- All containerized and orchestrated with Docker Compose

---

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Architecture Diagram](#architecture-diagram)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [CI/CD Pipeline](#cicd-pipeline)
- [Infrastructure Setup](#infrastructure-setup)
- [Deployment](#deployment)
- [Monitoring and Logs](#monitoring-and-logs)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features

### DevOps Implementation

- **Automated CI/CD:** Jenkins pipeline with 7 stages (Checkout, Build, Test, Push, Configure, Deploy, Health Check)
- **Infrastructure as Code:** AWS EC2 provisioning with Terraform
- **Configuration Management:** Automated deployment with Ansible
- **Container Orchestration:** Docker Compose for multi-container management
- **Image Registry:** DockerHub for container image distribution
- **Version Control:** Git/GitHub with webhook integration

### Application Features

- User authentication and authorization
- Task CRUD operations (Create, Read, Update, Delete)
- RESTful API backend
- Responsive React frontend
- Persistent data storage with AWS RDS

### DevOps Best Practices

- Multi-stage Docker builds for smaller images
- Environment-based configuration
- Health checks and monitoring
- Automated testing in CI pipeline
- Rollback capabilities
- Security scanning and compliance

---

## Technologies

### Development Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend Framework | React + Vite | 19.1.1 |
| UI Styling | Tailwind CSS | 3.4.17 |
| Backend Framework | Spring Boot | 3.5.5 |
| Programming Language | Java | 17 |
| Database | AWS RDS MySQL | 8.0 |
| Web Server | Nginx | 1.27 |

### DevOps Stack

| Tool | Purpose | Details |
|------|---------|---------|
| Jenkins | CI/CD Server | 2.541.1 |
| Docker | Containerization | 24.0+ |
| Docker Compose | Orchestration | 2.24+ |
| Terraform | Infrastructure as Code | AWS EC2 provisioning |
| Ansible | Configuration Management | Automated deployment |
| GitHub | Version Control | Webhook integration |
| DockerHub | Container Registry | Image distribution |

### Cloud Infrastructure

| Service | Usage | Instance Type |
|---------|-------|---------------|
| AWS EC2 | Application Server | t3.micro (Free Tier) |
| AWS RDS | Database Server | db.t3.micro (Free Tier) |
| AWS VPC | Networking | Default VPC |
| AWS Security Groups | Firewall | Custom rules |

---

## Architecture Diagram

### CI/CD Pipeline Flow

```
┌──────────────┐
│  Developer   │
└──────┬───────┘
       │ git push
       ▼
┌──────────────┐
│   GitHub     │ ◄──── Version Control
└──────┬───────┘
       │ webhook
       ▼
┌──────────────┐
│   Jenkins    │ ◄──── CI/CD Server
└──────┬───────┘       (Builds, Tests, Deploys)
       │
       ├─────► Build Docker Images
       │       (Backend + Frontend)
       │
       ├─────► Push to DockerHub
       │
       ├─────► Ansible Deployment
       │
       ▼
┌──────────────┐
│   AWS EC2    │ ◄──── Application Server
│              │       (t3.micro + 3GB swap)
│  ┌────────┐  │
│  │Frontend│  │ ◄──── React + Nginx (Port 80)
│  └────┬───┘  │
│       │      │
│  ┌────▼───┐  │
│  │Backend │  │ ◄──── Spring Boot (Port 8088)
│  └────┬───┘  │
└───────┼──────┘
        │ JDBC
        ▼
┌──────────────┐
│   AWS RDS    │ ◄──── Managed MySQL Database
│   MySQL 8.0  │       (db.t3.micro)
└──────────────┘
```

### Network Architecture

```
Internet
   │
   ▼
Security Group (EC2)
   │
   ├─ Port 80  → Frontend (Nginx)
   ├─ Port 8088 → Backend API (Spring Boot)
   ├─ Port 8080 → Jenkins CI/CD
   └─ Port 22  → SSH Access
   
   │ Internal Network
   ▼
Security Group (RDS)
   │
   └─ Port 3306 → MySQL Database
```

---

## Project Structure

```
task-tracker-devops/
│
├── frontend/                      # React Frontend Application
│   ├── src/
│   │   ├── components/           # React Components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── AddTaskModal.jsx
│   │   │   └── EditTaskModal.jsx
│   │   ├── api/                  # API Integration
│   │   │   └── tasks.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile                # Multi-stage build
│   ├── nginx.conf                # Nginx configuration
│   ├── package.json
│   └── vite.config.js
│
├── backend/                       # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/thisara/demo/
│   │   │   │   ├── DemoApplication.java
│   │   │   │   ├── config/
│   │   │   │   │   └── SecurityConfig.java
│   │   │   │   ├── controller/
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   └── TaskController.java
│   │   │   │   ├── dto/
│   │   │   │   │   └── CreateTaskRequest.java
│   │   │   │   ├── entity/
│   │   │   │   │   ├── Tasks.java
│   │   │   │   │   └── User.java
│   │   │   │   ├── repository/
│   │   │   │   │   ├── TaskRepository.java
│   │   │   │   │   └── UserRepository.java
│   │   │   │   └── service/
│   │   │   │       ├── TaskService.java
│   │   │   │       └── UserService.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── application-prod.properties
│   ├── Dockerfile                # Multi-stage Maven build
│   └── pom.xml
│
├── terraform/                     # Infrastructure as Code
│   ├── main.tf                   # EC2 instance configuration
│   ├── devops-key                # SSH private key (gitignored)
│   └── devops-key.pub            # SSH public key (gitignored)
│
├── ansible/                       # Configuration Management
│   ├── inventory.ini             # Server inventory
│   ├── deploy.yml                # Deployment playbook
│   └── .env.example              # Environment variables template
│
├── docker-compose.yml             # Container orchestration
├── Jenkinsfile                    # CI/CD pipeline definition
├── .gitignore
├── JENKINS_CREDENTIALS_GUIDE.md  # Credentials setup guide
├── RDS_SETUP_GUIDE.md            # AWS RDS configuration
├── DATABASE_SEPARATION_GUIDE.md  # Architecture documentation
└── README.md
```

---

## Prerequisites

### Required Tools

- **Git:** Version control
- **Docker:** 20.10+ (Containerization)
- **Docker Compose:** 2.0+ (Container orchestration)
- **Terraform:** 1.0+ (Infrastructure provisioning)
- **Ansible:** 2.9+ (Configuration management)
- **Java:** 17+ (For Spring Boot backend)
- **Node.js:** 18+ (For React frontend development)
- **Maven:** 3.8+ (Java build tool)

### Cloud Accounts

- **AWS Account** with access to:
  - EC2 (t3.micro Free Tier)
  - RDS (db.t3.micro Free Tier)
  - VPC and Security Groups
- **DockerHub Account** (Free tier)
- **GitHub Account**

### AWS Permissions Required

- EC2: Launch instances, manage security groups
- RDS: Create database instances
- VPC: Manage networking
- IAM: Access to AWS credentials

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/thisarasamuditha/task_tracker_devops.git
cd task_tracker_devops
```

### 2. Set Up AWS RDS Database

Follow the [RDS Setup Guide](RDS_SETUP_GUIDE.md) to create your MySQL database instance.

Quick setup:
```bash
# Create RDS MySQL instance in AWS Console
- DB identifier: devops-taskdb
- Master username: admin
- Master password: DevOps2026
- Instance: db.t3.micro
- Initial database: taskdb
```

### 3. Provision EC2 Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Review the execution plan
terraform plan

# Provision infrastructure
terraform apply

# Note the public IP address output
```

### 4. Configure Environment Variables

SSH to your EC2 instance and create `.env` file:

```bash
ssh -i terraform/devops-key ubuntu@<EC2_PUBLIC_IP>

mkdir -p ~/app
cd ~/app

cat > .env << 'EOF'
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_NAME=taskdb
DB_USER=devops
DB_PASSWORD=DevOps2026
EOF

chmod 600 .env
```

### 5. Set Up Jenkins

Install Jenkins on EC2:
```bash
sudo apt update
sudo apt install -y openjdk-17-jdk
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt update
sudo apt install -y jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

Access Jenkins at `http://<EC2_PUBLIC_IP>:8080`

### 6. Configure Jenkins Credentials

Follow the [Jenkins Credentials Guide](JENKINS_CREDENTIALS_GUIDE.md) to add:

1. **DockerHub Credentials** (ID: `dockerhub-credentials`)
2. **EC2 SSH Key** (ID: `ec2-ssh-key`)

### 7. Create Jenkins Pipeline

1. New Item → Pipeline → `devops-project-pipeline`
2. Pipeline from SCM → Git
3. Repository: `https://github.com/thisarasamuditha/task_tracker_devops.git`
4. Script Path: `Jenkinsfile`

### 8. Set Up GitHub Webhook

GitHub Repository → Settings → Webhooks:
- Payload URL: `http://<EC2_PUBLIC_IP>:8080/github-webhook/`
- Content type: `application/json`
- Events: Push events

### 9. Deploy Application

Push code to trigger automatic deployment:

```bash
git add .
git commit -m "Initial deployment"
git push origin master
```

Jenkins will automatically:
1. Build Docker images
2. Push to DockerHub
3. Deploy to EC2 via Ansible
4. Start containers with Docker Compose

### 10. Access Application

- Frontend: `http://<EC2_PUBLIC_IP>`
- Backend API: `http://<EC2_PUBLIC_IP>:8088/api`
- Jenkins: `http://<EC2_PUBLIC_IP>:8080`

---

## CI/CD Pipeline

### Pipeline Stages

The Jenkinsfile defines 7 automated stages:

#### Stage 1: Checkout
Pulls latest source code from GitHub repository.

```groovy
stage('Checkout') {
    steps {
        checkout scm
    }
}
```

#### Stage 2: Build Backend Image
Builds Spring Boot application using multi-stage Docker build with Maven.

```bash
docker build -t thisarasamuditha/backend:${BUILD_NUMBER} backend/
```

#### Stage 3: Build Frontend Image
Builds React application with Vite and packages with Nginx.

```bash
docker build --build-arg VITE_API_BASE_URL=http://EC2_IP:8088/api \
  -t thisarasamuditha/frontend:${BUILD_NUMBER} frontend/
```

#### Stage 4: Push Images to DockerHub
Authenticates with DockerHub and pushes both images with build number and latest tags.

```bash
docker push thisarasamuditha/backend:${BUILD_NUMBER}
docker push thisarasamuditha/backend:latest
```

#### Stage 5: Update docker-compose Configuration
Updates image references in docker-compose.yml with DockerHub username.

```bash
sed -i 's|image: .*/backend:|image: thisarasamuditha/backend:|g' docker-compose.yml
```

#### Stage 6: Deploy to EC2 using Ansible
Executes Ansible playbook to deploy containers on EC2 instance.

```bash
ansible-playbook -i inventory.ini deploy.yml \
  --private-key=${SSH_KEY_FILE}
```

#### Stage 7: Post Actions
Provides deployment URLs and cleans up temporary Docker images.

### Pipeline Execution Flow

```
Code Push → GitHub Webhook → Jenkins Trigger
   ↓
Checkout Code from GitHub
   ↓
Build Backend Docker Image (Maven + Spring Boot)
   ↓
Build Frontend Docker Image (Vite + React + Nginx)
   ↓
Push Images to DockerHub
   ↓
Update docker-compose.yml
   ↓
Ansible Deployment
   ├─ Copy docker-compose.yml to EC2
   ├─ Pull latest images from DockerHub
   ├─ Stop old containers
   └─ Start new containers
   ↓
Health Check & Verification
   ↓
Cleanup & Success Notification
```

---

## Infrastructure Setup

### Terraform Configuration

The `terraform/main.tf` file provisions:

- **EC2 Instance:** t3.micro with Ubuntu 22.04
- **Security Group:** Ports 22, 80, 8080, 8088
- **SSH Key Pair:** For secure access
- **Elastic IP:** (Optional) For static IP address

Key resources:
```hcl
resource "aws_instance" "devops_server" {
  ami           = "ami-0dee22c13ea7a9a67"  # Ubuntu 22.04
  instance_type = "t3.micro"
  key_name      = aws_key_pair.devops_key.key_name
  
  tags = {
    Name = "DevOps-Project-Server"
  }
}
```

### Ansible Deployment

The `ansible/deploy.yml` playbook:

1. Updates system packages
2. Installs Docker and Docker Compose
3. Copies docker-compose.yml and .env
4. Pulls latest Docker images
5. Stops old containers
6. Starts new containers
7. Verifies deployment

Key tasks:
```yaml
- name: Start containers with docker compose
  command: docker compose up -d
  args:
    chdir: /home/ubuntu/app
```

---

## Deployment

### Manual Deployment

```bash
# SSH to EC2
ssh -i terraform/devops-key ubuntu@<EC2_IP>

# Navigate to app directory
cd ~/app

# Pull latest images
docker compose pull

# Restart containers
docker compose down
docker compose up -d

# Verify
docker compose ps
```

### Automated Deployment (via Jenkins)

```bash
# Simply push code to GitHub
git add .
git commit -m "Update feature"
git push origin master

# Jenkins handles the rest automatically
```

### Rollback Strategy

```bash
# On EC2
cd ~/app

# View previous builds
docker images | grep thisarasamuditha

# Update docker-compose.yml to use specific version
# image: thisarasamuditha/backend:20  (previous build)

# Restart with old version
docker compose up -d
```

---

## Monitoring and Logs

### Application Logs

```bash
# View all container logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View specific service logs
docker compose logs backend
docker compose logs frontend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Container Health

```bash
# Check running containers
docker compose ps

# Container resource usage
docker stats

# Inspect container
docker inspect backend
```

### System Monitoring

```bash
# Memory usage
free -h

# Disk usage
df -h

# Running processes
htop

# Network connections
netstat -tulpn
```

### Jenkins Build Logs

Access at: `http://<EC2_IP>:8080/job/devops-project-pipeline/`

Each build shows:
- Console Output
- Build artifacts
- Test results
- Deployment status

---

## Security Considerations

### Implemented Security Measures

1. **Environment Variables:** Sensitive data stored in `.env` file (not in Git)
2. **SSH Key Authentication:** Secure EC2 access
3. **Security Groups:** Restricted inbound rules
4. **Private Container Network:** Isolated Docker network
5. **RDS Security:** Database in private subnet with restricted access

### Best Practices Applied

```bash
# .env file permissions
chmod 600 .env

# SSH key permissions
chmod 600 terraform/devops-key

# Never commit secrets
# .gitignore includes:
# - *.pem
# - *.key
# - .env
# - terraform.tfstate
```

### Security Group Rules

**EC2 Instance:**
```
Inbound:
- Port 22  (SSH)      - Your IP only
- Port 80  (HTTP)     - 0.0.0.0/0
- Port 8080 (Jenkins) - Your IP only
- Port 8088 (API)     - 0.0.0.0/0

Outbound:
- All traffic allowed
```

**RDS Instance:**
```
Inbound:
- Port 3306 (MySQL) - EC2 Security Group only
```

---

## Troubleshooting

### Common Issues and Solutions

#### Jenkins Build Fails

**Issue:** Docker build fails with permission denied
```bash
# Solution: Add jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

#### Container Won't Start

**Issue:** Backend container exits immediately
```bash
# Check logs
docker compose logs backend

# Common causes:
# 1. Database connection failed - Check .env file
# 2. Port already in use - Stop conflicting services
# 3. Image not found - Verify DockerHub push succeeded
```

#### Database Connection Error

**Issue:** Backend can't connect to RDS
```bash
# Verify environment variables
cat ~/app/.env

# Test connection
mysql -h <RDS_ENDPOINT> -u devops -p

# Check security group allows EC2 → RDS on port 3306
```

#### Memory Issues

**Issue:** Containers killed due to OOM
```bash
# Check memory usage
free -h
docker stats

# Solution: Using RDS separates database from EC2
# Ensures EC2 has enough resources for application
```

#### Ansible Deployment Fails

**Issue:** SSH connection timeout
```bash
# Verify SSH key permissions
chmod 600 terraform/devops-key

# Test SSH connection
ssh -i terraform/devops-key ubuntu@<EC2_IP>

# Check inventory.ini has correct IP
```

### Debug Commands

```bash
# Check all running containers
docker ps -a

# Inspect container configuration
docker inspect backend

# View container logs with timestamps
docker compose logs -t backend

# Check Docker daemon
sudo systemctl status docker

# Verify network connectivity
docker network ls
docker network inspect app_app-network

# Check disk space
df -h

# View system logs
journalctl -u docker
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure CI/CD pipeline passes

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

**Thisara Samuditha**

- GitHub: [@thisarasamuditha](https://github.com/thisarasamuditha)
- LinkedIn: [Thisara Samuditha](https://linkedin.com/in/thisarasamuditha)
- Email: thisarasamuditha@example.com

---

## Acknowledgments

- Spring Boot documentation and community
- React and Vite documentation
- Jenkins documentation
- Terraform by HashiCorp
- Ansible documentation
- Docker documentation
- AWS documentation

---

**Project Status:** Active Development

**Last Updated:** January 2026

## Phase 3: Dockerize Applications

### Goal
Create production-ready Dockerfiles that can be built independently.

### 3.1 Frontend Dockerfile

The frontend Dockerfile uses a multi-stage build:
- **Stage 1:** Node.js build environment
- **Stage 2:** Nginx runtime

Key features:
- Accepts `VITE_API_BASE_URL` build argument
- Optimized layer caching
- Minimal production image

```dockerfile
# See frontend/Dockerfile for complete implementation
```

### 3.2 Backend Dockerfile

The backend Dockerfile uses a multi-stage build:
- **Stage 1:** Maven build
- **Stage 2:** Java runtime (JRE)

Key features:
- Non-root user for security
- Optimized layer caching
- Minimal production image

```dockerfile
# See backend/Dockerfile for complete implementation
```

### 3.3 Test Local Builds

Run these commands in **WSL Ubuntu** from your project root:

```bash
# Navigate to project directory in WSL
cd "/mnt/f/sem 5 mine/DevOps/project/version_2.0_completed_finalized"

# Build backend image
cd backend
docker build -t your-dockerhub-username/backend:test .
cd ..

# Build frontend image
cd frontend
docker build -t your-dockerhub-username/frontend:test \
  --build-arg VITE_API_BASE_URL=http://localhost:8088/api .
cd ..

# Verify images were created
docker images | grep "your-dockerhub-username"
```

**✅ Phase 3 Complete** when both images build successfully.

**Note:** You don't need to build a MySQL image - it will be pulled from DockerHub automatically.

---

## Phase 3.5: Database Configuration (NEW)

### Goal
Configure MySQL database to run inside EC2 alongside frontend and backend.

### 3.5.1 Database Setup Overview

**Architecture:**
```
EC2 Instance (t3.micro - 1GB RAM)
├── MySQL Container (Port 3306) - ~300MB RAM
├── Backend Container (Port 8088) - ~400MB RAM
└── Frontend Container (Port 80) - ~200MB RAM
```

**Key Points:**
- MySQL runs in a Docker container using official `mysql:8.0` image
- Data persists in Docker volume `mysql_data`
- Backend connects to database via Docker network (service name: `db`)
- Database credentials managed via environment variables
- Memory limits set for t3.micro compatibility

### 3.5.2 Database Credentials

**Default credentials** (can be changed in docker-compose.yml):
- **Root Password:** `DevOps@2026`
- **Database Name:** `taskdb`
- **Username:** `devops`
- **Password:** `DevOps@2026`

**⚠️ Important:** These are for academic/demo purposes. In production, use strong passwords and secrets management.

### 3.5.3 Verify Backend MySQL Driver

Ensure `pom.xml` includes MySQL connector:

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

### 3.5.4 Test Database Connection Locally (Optional)

```bash
# Start all services locally
cd "/mnt/f/sem 5 mine/DevOps/project/version_2.0_completed_finalized"
docker-compose up -d

# Check containers
docker ps

# View database logs
docker logs mysql_db

# Connect to database
docker exec -it mysql_db mysql -u devops -pDevOps@2026 taskdb

# Inside MySQL shell:
SHOW DATABASES;
USE taskdb;
SHOW TABLES;
exit
```

**✅ Phase 3.5 Complete** when you understand the database setup.

---

## Phase 4: Terraform EC2 Provisioning

### Goal
Create an EC2 instance with proper security groups using Terraform.

### 4.1 Install Terraform

```bash
# In WSL Ubuntu
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform -y

# Verify
terraform --version
```

### 4.2 Generate SSH Key Pair

```bash
cd "/mnt/f/sem 5 mine/DevOps/project/version_2.0_completed_finalized/terraform"

# Generate SSH key (no passphrase for automation)
ssh-keygen -t rsa -b 4096 -f devops-key -N ""

# This creates: devops-key (private) and devops-key.pub (public)
ls -la devops-key*
```

### 4.3 Configure AWS Credentials

```bash
# Install AWS CLI
sudo apt install awscli -y

# Configure credentials
aws configure
# Enter AWS Access Key ID
# Enter AWS Secret Access Key
# Region: us-east-1 (or preferred)
# Output: json
```

**Get AWS credentials:**
1. AWS Console → IAM → Users → Your user → Security credentials
2. Create access key → CLI
3. Save Access Key ID and Secret

### 4.4 Deploy Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Preview changes
terraform plan

# Create infrastructure
terraform apply
# Type 'yes' when prompted

# Save the outputs (Public IP, SSH command, URLs)
```

### 4.5 Test SSH Connection

```bash
# Set correct permissions
chmod 400 devops-key

# Test connection
ssh -i devops-key ubuntu@<EC2_PUBLIC_IP>

# Exit
exit
```

**Common Issues:**
- **AMI not found:** Check AMI ID for your region at [Ubuntu Cloud Images](https://cloud-images.ubuntu.com/locator/ec2/)
- **Permission denied:** Run `chmod 400 devops-key`
- **Timeout:** Verify security group allows port 22

**✅ Phase 4 Complete** when you can SSH into EC2.

---

## Phase 5: Ansible Setup and Deployment

### Goal
Use Ansible to install Docker on EC2 and deploy containers.

### 5.1 Install Ansible

```bash
# In WSL Ubuntu
sudo apt update
sudo apt install ansible -y

# Verify
ansible --version
```

### 5.2 Update Ansible Inventory

Edit `ansible/inventory.ini` and replace `<EC2_PUBLIC_IP>` with your actual EC2 IP from Terraform output.

```ini
[devops_server]
devops ansible_host=<EC2_PUBLIC_IP> ansible_user=ubuntu ansible_ssh_private_key_file=../terraform/devops-key ansible_ssh_common_args='-o StrictHostKeyChecking=no'

[devops_server:vars]
ansible_python_interpreter=/usr/bin/python3
```

### 5.3 Update docker-compose.yml

Replace `YOUR_DOCKERHUB_USERNAME` in `docker-compose.yml` with your actual DockerHub username.

### 5.4 Test Ansible Connection

```bash
cd ansible

# Test ping
ansible devops_server -i inventory.ini -m ping

# Expected: devops | SUCCESS => { "ping": "pong" }
```

### 5.5 Run Ansible Playbook

```bash
# Set DockerHub credentials
export DOCKER_USERNAME=your-dockerhub-username
export DOCKER_PASSWORD=your-dockerhub-password

# Run deployment
ansible-playbook -i inventory.ini deploy.yml

# Watch output - installs Docker, copies files, starts containers
```

**Common Issues:**
- **SSH fails:** Update EC2 IP in inventory.ini
- **Permission denied:** Check key permissions: `chmod 400 ../terraform/devops-key`
- **Docker install fails:** Ensure EC2 has internet access

**✅ Phase 5 Complete** when Ansible successfully deploys containers.

---

## Phase 6: Jenkins Pipeline

### Goal
Create a Jenkins pipeline that builds, pushes, and deploys automatically.

### 6.1 Prepare Jenkins Environment

```bash
# In WSL, add Jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Install Ansible
sudo apt install ansible -y

# Verify Jenkins can use Docker
sudo -u jenkins docker ps

# Verify Ansible
sudo -u jenkins ansible --version
```

### 6.2 Configure Jenkins Credentials

Access Jenkins at `http://localhost:8088`:

1. **DockerHub Credentials:**
   - Navigate: Manage Jenkins → Credentials → System → Global credentials
   - Add Credentials
   - Kind: **Username with password**
   - Username: your DockerHub username
   - Password: your DockerHub password
   - ID: `dockerhub-credentials`

2. **SSH Key for EC2:**
   - Add Credentials
   - Kind: **SSH Username with private key**
   - ID: `ec2-ssh-key`
   - Username: `ubuntu`
   - Private Key: Enter directly → paste contents of `terraform/devops-key`

3. **EC2 IP Address:**
   - Add Credentials
   - Kind: **Secret text**
   - Secret: Your EC2 public IP
   - ID: `ec2-ip`

### 6.3 Update Jenkinsfile

Replace `YOUR_DOCKERHUB_USERNAME` in `Jenkinsfile` with your actual DockerHub username.

### 6.4 Create Jenkins Pipeline Job

1. Open Jenkins → **New Item**
2. Name: `devops-project-pipeline`
3. Type: **Pipeline**
4. Configuration:
   - Pipeline definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/your-username/your-repo.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
5. **Save**

**✅ Phase 6 Complete** when Jenkins pipeline is configured.

---

## Phase 7: End-to-End CI/CD Flow

### Goal
Test the complete workflow from GitHub to production.

### 7.1 Push to GitHub

```bash
cd "/mnt/f/sem 5 mine/DevOps/project/version_2.0_completed_finalized"

# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Initial DevOps project setup"

# Add remote (create repo on GitHub first)
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

### 7.2 Trigger Pipeline

**Option 1: Manual Trigger**
- Jenkins → `devops-project-pipeline` → **Build Now**

**Option 2: Auto-trigger with Webhook**
- GitHub repo → Settings → Webhooks → Add webhook
- Payload URL: `http://your-jenkins-ip:8088/github-webhook/`
- Content type: `application/json`

### 7.3 Monitor Pipeline

Watch Jenkins console output for:
1. ✅ Checkout
2. ✅ Build Backend Image
3. ✅ Build Frontend Image
4. ✅ Push Images to DockerHub
5. ✅ Deploy to EC2 with Ansible

### 7.4 Verify Deployment

```bash
# SSH into EC2
ssh -i terraform/devops-key ubuntu@<EC2_IP>

# Check containers
docker ps

# Check logs
docker logs frontend
docker logs backend

# Exit
exit
```

### 7.5 Access Application

Open browser:
- **Frontend:** `http://<EC2_PUBLIC_IP>`
- **Backend API:** `http://<EC2_PUBLIC_IP>:8088/api`

**✅ Phase 7 Complete** when application is accessible on EC2.

---

## Phase 8: Verification and Troubleshooting

### Complete Verification Checklist

**Infrastructure:**
- [ ] EC2 instance running
- [ ] Security groups allow ports 22, 80, 8088
- [ ] SSH connection works

**Docker Images:**
- [ ] Images visible in DockerHub
- [ ] Both `latest` and build-number tags present

**EC2 Deployment:**
- [ ] Docker installed on EC2
- [ ] Containers running (`docker ps`)
- [ ] Frontend accessible
- [ ] Backend API responding

**CI/CD Pipeline:**
- [ ] Jenkins pipeline runs successfully
- [ ] All stages pass
- [ ] Ansible deployment succeeds

### Common Issues and Fixes

#### Issue 1: Jenkins can't connect to Docker

**Symptoms:** `permission denied while trying to connect to Docker daemon`

**Fix:**
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
sudo -u jenkins docker ps
```

#### Issue 2: Ansible SSH connection fails

**Symptoms:** `Failed to connect to the host via ssh`

**Fix:**
```bash
# Check key permissions
chmod 400 terraform/devops-key

# Verify manual SSH works
ssh -i terraform/devops-key ubuntu@<EC2_IP>

# Update inventory.ini with correct IP
```

#### Issue 3: Frontend can't reach backend

**Symptoms:** Network errors or 404 from frontend

**Fix:**
```bash
# Verify frontend built with correct API URL
# Check Jenkins build logs for:
# --build-arg VITE_API_BASE_URL=http://<EC2_IP>:8088/api

# Test backend directly
ssh -i terraform/devops-key ubuntu@<EC2_IP>
curl http://localhost:8088/api
```

#### Issue 4: Docker Compose not found

**Symptoms:** `docker compose: command not found`

**Fix:**
```bash
ssh -i terraform/devops-key ubuntu@<EC2_IP>
sudo apt update
sudo apt install docker-compose-plugin -y
docker compose version
```

#### Issue 5: Port already in use

**Symptoms:** `port is already allocated`

**Fix:**
```bash
ssh -i terraform/devops-key ubuntu@<EC2_IP>
sudo lsof -i :8088
sudo kill -9 <PID>

# Or restart containers
cd /home/ubuntu/app
docker compose down
docker compose up -d
```

#### Issue 6: Images not pulling latest

**Symptoms:** Old code still running after deployment

**Fix:**
```bash
ssh -i terraform/devops-key ubuntu@<EC2_IP>
cd /home/ubuntu/app
docker compose pull
docker compose down
docker compose up -d --force-recreate
```

#### Issue 7: Database connection fails

**Symptoms:** Backend logs show "Connection refused" or "Unknown database"

**Fix:**
```bash
ssh -i terraform/devops-key ubuntu@<EC2_IP>

# Check if MySQL container is running
docker ps | grep mysql

# Check MySQL logs
docker logs mysql_db

# Wait for MySQL to be fully ready (takes ~30 seconds)
docker logs -f mysql_db | grep "ready for connections"

# Test database connection
docker exec mysql_db mysql -u devops -pDevOps@2026 -e "SHOW DATABASES;"

# If needed, restart backend after database is ready
docker restart backend
```

#### Issue 8: Out of memory on EC2

**Symptoms:** Containers crashing, `docker ps` shows containers restarting

**Fix:**
```bash
# Check memory usage
docker stats --no-stream

# Check EC2 memory
free -h

# If out of memory, reduce MySQL buffer pool
# Edit docker-compose.yml and add to db service:
command: --innodb-buffer-pool-size=128M

# Restart containers
docker compose down
docker compose up -d
```

### Useful Monitoring Commands

```bash
# Check EC2 status
aws ec2 describe-instances --instance-ids <INSTANCE_ID>

# SSH and monitor
ssh -i terraform/devops-key ubuntu@<EC2_IP>
docker ps
docker stats
docker logs -f frontend
docker logs -f backend
docker logs -f mysql_db

# Check database tables
docker exec mysql_db mysql -u devops -pDevOps@2026 taskdb -e "SHOW TABLES;"

# Test Ansible
cd ansible
ansible devops_server -i inventory.ini -m ping

# Jenkins logs
sudo journalctl -u jenkins -f

# Docker disk usage
docker system df
```

---

## Complete Workflow

```
Developer → GitHub → Jenkins → DockerHub → Ansible → EC2 (Frontend + Backend + Database)
```

1. **Developer** pushes code to GitHub
2. **GitHub** triggers Jenkins webhook (or manual build)
3. **Jenkins:**
   - Clones repository
   - Builds frontend Docker image (with EC2 API URL)
   - Builds backend Docker image
   - Pushes images to DockerHub
   - Triggers Ansible playbook
4. **Ansible:**
   - Connects to EC2 via SSH
   - Installs Docker if needed
   - Copies docker-compose.yml
   - Pulls latest frontend/backend images from DockerHub
   - Pulls MySQL image from DockerHub
   - Runs `docker compose up -d`
5. **EC2 (All containers on single instance):**
   - MySQL container (port 3306) - data persists in volume
   - Backend container (port 8088) - connects to MySQL
   - Frontend container (port 80) - proxies API calls
6. **Users** access application at `http://<EC2_IP>`

**Container Communication:**
```
Frontend (Nginx) → Backend (Spring Boot) → MySQL Database
      ↓                    ↓                      ↓
   Port 80             Port 8088              Port 3306
                    (Docker network: app-network)
```

---

## Clean Up

When done with the project:

```bash
# Stop containers on EC2
ssh -i terraform/devops-key ubuntu@<EC2_IP> "cd /home/ubuntu/app && docker compose down"

# Destroy infrastructure
cd terraform
terraform destroy
# Type 'yes' when prompted

# Remove local images
docker rmi your-username/frontend:latest your-username/backend:latest

# Clean Docker system
docker system prune -a -f
```

**Remove from DockerHub:**
- Visit https://hub.docker.com → Repositories → Delete

---

## Next Steps for Enhancement

- [ ] Add database (MySQL/PostgreSQL) to docker-compose.yml
- [ ] Implement health checks
- [ ] Set up HTTPS with Let's Encrypt
- [ ] Add monitoring (Prometheus + Grafana)
- [ ] Implement automated testing
- [ ] Add staging environment
- [ ] Blue-green deployment strategy
- [ ] Add secrets management (AWS Secrets Manager)

---

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Ansible Documentation](https://docs.ansible.com/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)

---

## License

This project is for educational purposes as part of a university DevOps course.

---

## Author
- Thisara Samuditha BSc (Hons) in Computer Engineering (UG)
- UOR

