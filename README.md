# DevOps Project: React + Spring Boot CI/CD Pipeline

Complete DevOps implementation for deploying a React frontend and Spring Boot backend application using Jenkins, Docker, Terraform, and Ansible on AWS EC2.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Phase 3: Dockerize Applications](#phase-3-dockerize-applications)
- [Phase 4: Terraform EC2 Provisioning](#phase-4-terraform-ec2-provisioning)
- [Phase 5: Ansible Setup and Deployment](#phase-5-ansible-setup-and-deployment)
- [Phase 6: Jenkins Pipeline](#phase-6-jenkins-pipeline)
- [Phase 7: End-to-End CI/CD Flow](#phase-7-end-to-end-cicd-flow)
- [Phase 8: Verification and Troubleshooting](#phase-8-verification-and-troubleshooting)
- [Complete Workflow](#complete-workflow)
- [Clean Up](#clean-up)

---

## Project Overview

This project demonstrates a complete DevOps CI/CD pipeline for a full-stack application:
- **Frontend:** React (Vite) served by Nginx
- **Backend:** Spring Boot REST API
- **Database:** MySQL 8.0 (containerized)
- **Infrastructure:** AWS EC2 (provisioned with Terraform)
- **Configuration Management:** Ansible
- **CI/CD:** Jenkins
- **Containerization:** Docker
- **Container Registry:** DockerHub

**Architecture:** All components (frontend, backend, database) run as Docker containers on a single EC2 instance, orchestrated by Docker Compose.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19 + Vite |
| Backend | Spring Boot 3.5.5 (Java 17) |
| Database | MySQL 8.0 |
| Web Server | Nginx |
| Containerization | Docker |
| Container Orchestration | Docker Compose |
| CI/CD | Jenkins |
| Infrastructure as Code | Terraform |
| Configuration Management | Ansible |
| Cloud Provider | AWS EC2 (t3.micro - Free Tier) |
| Container Registry | DockerHub |
| Version Control | Git + GitHub |

---

## Project Structure

```
.
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   ├── Dockerfile
│   ├── pom.xml
│   └── mvnw
├── terraform/
│   ├── main.tf
│   ├── devops-key (git-ignored)
│   └── devops-key.pub (git-ignored)
├── ansible/
│   ├── inventory.ini
│   └── deploy.yml
├── docker-compose.yml
├── Jenkinsfile
├── .gitignore
└── README.md
```

**On Windows with WSL (Ubuntu):**
- Windows 10/11 with WSL2
- Ubuntu 22.04 in WSL
- Docker installed in WSL (NOT Docker Desktop)
- Java 17+ (for Jenkins)
- Jenkins installed as systemd service
- Git

**Accounts Needed:**
- AWS Account (Free Tier)
- DockerHub Account
- GitHub Account

---

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
Thisara Samuditha
University DevOps Project - 2026
