# Jenkins CI/CD Setup Guide for DevOps Pipeline

## Pipeline Architecture Overview

This guide sets up a complete CI/CD pipeline following these steps:

1. Developer pushes code to GitHub
2. GitHub webhook triggers Jenkins CI
3. Jenkins builds Docker images (Frontend + Backend)
4. Images pushed to Docker Hub
5. Terraform provisions AWS EC2 VM
6. Ansible pulls images and deploys containers
7. Frontend (React) and Backend (Spring Boot) run on AWS EC2
8. Backend connects to MySQL database within the same EC2 instance
9. Users access application via HTTP

---

## Prerequisites

- AWS account with EC2 access
- GitHub repository with your application code
- DockerHub account
- SSH key pair for EC2 access
- Basic Linux command knowledge

---

## Part 1: AWS EC2 Setup for Jenkins

### Step 1: Create EC2 Instance for Jenkins

**Note:** This is separate from your application EC2. Jenkins will deploy TO your application EC2.

1. **Login to AWS Console**
   - Navigate to EC2 Dashboard
   - Click "Launch Instance"

2. **Configure Instance:**
   - Name: `jenkins-server`
   - AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
   - Instance type: `t3.small` (2 GB RAM minimum for Jenkins)
   - Key pair: Create new or use existing
   - Security Group: Create with following rules:

   | Type | Port | Source | Description |
   |------|------|--------|-------------|
   | SSH | 22 | Your IP | SSH access |
   | Custom TCP | 8080 | 0.0.0.0/0 | Jenkins Web UI |
   | HTTP | 80 | 0.0.0.0/0 | Optional |

3. **Launch Instance** and note the Public IP

### Step 2: Connect to Jenkins Server

```bash
# Set correct permissions for SSH key
chmod 400 your-key.pem

# Connect to Jenkins EC2
ssh -i your-key.pem ubuntu@JENKINS_EC2_PUBLIC_IP
```

---

## Part 2: Install Jenkins on EC2

### Step 1: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Java (Required for Jenkins)

```bash
# Install OpenJDK 17
sudo apt install openjdk-17-jdk -y

# Verify installation
java -version
```

**Expected Output:**
```
openjdk version "17.0.x"
```

### Step 2.3: Install Jenkins
```bash
# Add Jenkins repository key
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

# Add Jenkins repository
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Java 17
sudo apt install openjdk-17-jdk -y

# Verify installation
java -version
```

Expected output:
```
openjdk version "17.x.x"
```

### Step 3: Install Jenkins

```bash
# Add Jenkins repository key
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

# Add Jenkins repository
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Update package list
sudo apt update

# Install Jenkins
sudo apt install jenkins -y
```

### Step 4: Start Jenkins Service

```bash
# Start Jenkins
sudo systemctl start jenkins

# Enable Jenkins to start on boot
sudo systemctl enable jenkins

# Check Jenkins status
sudo systemctl status jenkins
```

Expected output:
```
Active: active (running)
```

---

## Part 3: Install Docker on Jenkins Server

### Step 1: Install Docker

```bash
# Install prerequisites
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update and install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# Verify Docker installation
docker --version
docker compose version
```

### Step 2: Allow Jenkins to Use Docker

```bash
# Add Jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins to apply group changes
sudo systemctl restart jenkins

# Verify Jenkins can use Docker
sudo -u jenkins docker ps
```

Expected output: (empty list is fine)
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

---

## Part 4: Install Ansible on Jenkins Server

```bash
# Install Ansible
sudo apt install ansible -y


### Step 1: Access Jenkins Web Interface

1. Open browser and go to:
   ```
   http://JENKINS_EC2_PUBLIC_IP:8080
   ```

2. **Unlock Jenkins:**
   - Get initial admin password:
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
   - Copy and paste it in browser

3. **Install Suggested Plugins:**
   - Click "Install suggested plugins"
   - Wait for completion (5-10 minutes)

4. **Create Admin User:**
   - Username: `admin`
   - Password: (create strong password)
   - Full name: Your name
   - Email: Your email
   - Click "Save and Continue"

5. **Instance Configuration:**
   - Jenkins URL: `http://JENKINS_EC2_PUBLIC_IP:8080/`
   - Click "Save and Finish"

### Step 2: Install Required Plugins

1. **Go to:** Manage Jenkins → Manage Plugins → Available plugins

2. **Install these plugins:**
   - Docker Pipeline
   - Docker
   - Git
   - GitHub
   - Pipeline
   - SSH Agent
   - Credentials Binding
   - Ansible

3. **Restart Jenkins:**
   ```bash
   sudo systemctl restart jenkins
   ```

---

## Part 6: Configure Jenkins Credentials

### Step 1: Add DockerHub Credentials

1. Go to: Manage Jenkins → Credentials → System → Global credentials
2. Click "Add Credentials"
3. Configure:
   - Kind: Username with password
   - Username: (your DockerHub username)
   - Password: (your DockerHub password or token)
   - ID: `dockerhub-creds`
   - Description: DockerHub credentials
4. Click "Create"

### Step 2: Add EC2 SSH Key

1. Click "Add Credentials" again
2. Configure:
   - Kind: SSH Username with private key
   - ID: `ec2-ssh-key`
   - Description: EC2 SSH Key
   - Username: `ubuntu`
   - Private Key: Enter directly
   - Paste your SSH private key content
3. Click "Create"

---

## Part 7: Setup GitHub Webhook

### Step 1: In GitHub Repository

1. Go to your repository Settings
2. Click Webhooks → Add webhook
3. Configure:
   - Payload URL: `http://JENKINS_EC2_PUBLIC_IP:8080/github-webhook/`
   - Content type: `application/json`
   - Events: Just the push event
   - Active: Check
4. Click "Add webhook"

---

## Part 8: Create Jenkins Pipeline Job

### Step 1: Create Pipeline

1. Jenkins Dashboard → New Item
2. Name: `devops-project-pipeline`
3. Type: Pipeline
4. Click OK

### Step 2: Configure Job

1. **General:**
   - Check "GitHub project"
   - Project URL: `https://github.com/YOUR_USERNAME/YOUR_REPO`

2. **Build Triggers:**
   - Check "GitHub hook trigger for GITScm polling"

3. **Pipeline:**
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: `https://github.com/YOUR_USERNAME/YOUR_REPO.git`
   - Branch: `*/main` or `*/master`
   - Script Path: `Jenkinsfile`

4. Click "Save"

---

## Part 9: Verify Pipeline Components

### Check 1: Verify Ansible Inventory

Ensure `ansible/inventory.ini` contains:

```ini
[devops]
<EC2_PUBLIC_IP> ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/ec2-key.pem
```

### Check 2: Verify Ansible Playbook

Ensure `ansible/deploy.yml` exists and contains deployment tasks for:
- Installing Docker on target EC2
- Copying docker-compose.yml
- Pulling images from DockerHub
- Starting containers

### Check 3: Verify docker-compose.yml

Ensure your docker-compose.yml includes:
- MySQL database service
- Backend service (depends on database)
- Frontend service (depends on backend)

---

## Part 10: Test Pipeline

### Step 1: Manual Build

1. Go to your pipeline job
2. Click "Build Now"
3. Monitor Console Output

### Step 2: Verify Deployment

After build completes:

```bash
# SSH to application EC2
ssh -i your-key.pem ubuntu@APP_EC2_IP

# Check containers
docker ps

# Should see: mysql, backend, frontend containers running
```

### Step 3: Test Application

- Frontend: `http://APP_EC2_IP`
- Backend API: `http://APP_EC2_IP:8088/api`

### Step 4: Test GitHub Webhook

1. Make a change to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Test CI/CD pipeline"
   git push origin main
   ```
3. Jenkins should automatically trigger build

---

## Troubleshooting

### Issue: Jenkins can't use Docker

```bash
# Add jenkins to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins
```

### Issue: Ansible can't connect to EC2

Check:
1. SSH key path is correct in inventory.ini
2. EC2 security group allows SSH from Jenkins EC2
3. SSH key has correct permissions (chmod 400)

### Issue: Containers not starting on application EC2

```bash
# Check Docker logs
docker logs <container_name>

# Check available memory
free -h

# May need to increase EC2 instance size
```

### Issue: GitHub webhook not triggering

1. Check webhook delivery in GitHub Settings
2. Verify Jenkins URL is accessible publicly
3. Check Jenkins system log for webhook attempts

---

## Summary

You now have:
1. Jenkins server on separate EC2
2. Automated CI/CD pipeline
3. GitHub webhook triggering builds
4. Docker images built and pushed to DockerHub
5. Ansible deploying to application EC2
6. Complete application stack running on EC2

**Pipeline Flow:**
```
GitHub Push → Webhook → Jenkins → Build Images → Push to DockerHub → 
Ansible Deploy → EC2 Containers → Running Application
```

---

## Next Steps

1. Add automated testing stage to pipeline
2. Implement blue-green deployment
3. Add monitoring with Prometheus/Grafana
4. Setup backup for MySQL database
5. Add SSL/HTTPS with Let's Encrypt
                        docker tag ${BACKEND_IMAGE}:${BUILD_NUMBER} ${BACKEND_IMAGE}:latest
                    '''
                }
            }
        }
        
        stage('Push to DockerHub') {
            steps {
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/devops-frontend"
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/devops-backend"
        APP_DIR = '/home/ubuntu/app'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo 'Building Frontend Docker Image...'
                dir('frontend') {
                    sh '''
                        docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} .
                        docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER} ${FRONTEND_IMAGE}:latest
                    '''
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                echo 'Building Backend Docker Image...'
                dir('backend') {
                    sh '''
                        docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} .
                        docker tag ${BACKEND_IMAGE}:${BUILD_NUMBER} ${BACKEND_IMAGE}:latest
                    '''
                }
            }
        }
        
        stage('Push to DockerHub') {
            steps {
                echo 'Pushing images to DockerHub...'
                sh '''
                    echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                    docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                    docker push ${FRONTEND_IMAGE}:latest
                    docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                    docker push ${BACKEND_IMAGE}:latest
                '''
            }
        }
        
        stage('Deploy Locally') {
            steps {
                echo 'Deploying on same server...'
                sh '''
                    # Create app directory if not exists
                    mkdir -p ${APP_DIR}
                    
                    # Copy docker-compose file
                    cp docker-compose.yml ${APP_DIR}/
                    
                    # Navigate to app directory
                    cd ${APP_DIR}
                    
                    # Stop existing containers
                    docker compose down || true
                    
                    # Pull latest images
                    docker pull ${FRONTEND_IMAGE}:latest
                    docker pull ${BACKEND_IMAGE}:latest
                    
                    # Start containers
                    docker compose up -d
                    
                    # Show running containers
                    docker ps
                    
                    # Show application status
                    echo "Frontend running on: http://$(curl -s ifconfig.me):80"
                    echo "Backend running on: http://$(curl -s ifconfig.me):8088"
                '''
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up...'
            sh 'docker logout'
        }
        success {
            echo '✅ Pipeline executed successfully!'
            echo '🌐 Application deployed and running!'
        }
        failure {
            echo '❌ Pipeline failed! Check logs for details.
---

## Part 11: Troubleshooting

### Common Issues and Solutions

#### 1. Jenkins Won't Start
```bash
# Check Jenkins logs
sudo journalctl -u jenkins -f

# Restart Jenkins
sudo systemctl restart jenkins
```

#### 2. Docker Permission Denied
```bash
# Add jenkins to docker group again
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Verify
sudo -u jenkins docker ps
```

#### 3. SSH Connection Failed
```bash
# Test SSH connection from Jenkins server
sudo su - jenkins
ssh -i ~/.ssh/id_rsa ubuntu@YOUR_APP_SERVER_IP

# If fails, regenerate keys and copy again
```

#### 4. GitHub Webhook Not Triggering
- Check webhook delivery in GitHub (Settings → Webhooks → Recent Deliveries)
- Ensure Jenkins URL is publicly accessible
- Check Jenkins logs: `sudo tail -f /var/log/jenkins/jenkins.log`

#### 5. Build Fails - Cannot Connect to Docker
```bash
# Restart Docker
sudo systemctl restart docker
sudo systemctl restart jenkins
```

#### 6. Out of Memory Error
```bash
# Increase Jenkins memory
sudo nano /etc/default/jenkins

# Add or modify:
JAVA_ARGS="-Xmx2048m"

# Restart
sudo systemctl restart jenkins
```

---

## Part 12: Security Best Practices

### 12.1: Secure Jenkins

1. **Change Default Port (Optional):**
   ```bash
   sudo Deployment Failed - Permission Issues
```bash
# Ensure Jenkins has proper permissions
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Check if app directory exists and has proper permissions
sudo mkdir -p /home/ubuntu/app
sudo chown -R ubuntu:ubuntu /home/ubuntu/appt)
   - Configure Nginx as reverse proxy

3. **Update Security Group:**
   - Restrict SSH access to your IP only
   - Consider using AWS Systems Manager Session Manager instead of SSH

### 12.2: Regular Maintenance

```bash
# Update Jenkins
sudo apt update
sudo apt upgrade jenkins -y

# Backup Jenkins
sudo tar -czf jenkins-backup-$(date +%Y%m%d).tar.gz /var/lib/jenkins/

# Clean old Docker images
docker system prune -a -f
```

---

## Part 13: Monitoring

### 13.1: Monitor Jenkins

```bash
# Check Jenkins status
sudo systemctl status jenkins

# Check disk space
df -h

# Check memory usage
free -h

# Monitor logs
sudo tail -f /var/log/jenkins/jenkins.log
```

### 13.2: Monitor Application

```bash
# SSH to application server
ssh -i jenkins-key.pem ubuntu@YOUR_APP_SERVER_IP

# Check running containers
docker ps

# Check logs
docker logs frontend-container
docker logs backend-container
docker logs mysql-container
```

---

## Summary

✅ **Jenkins Server:** Running on AWS EC2 at `http://YOUR_JENKINS_IP:8088`  
✅ **Docker:** Installed and configured for building images  
✅ **Ansible:** Installed for configuration management  
✅ **Credentials:** DockerHub, SSH keys configured  
✅ **Pipeline:** Automated CI/CD from GitHub push to EC2 deployment  
✅ **Webhook:** GitHub triggers Jenkins automatically  

---

## Next Steps

1. **Setup Monitoring:** Add monitoring tools like Prometheus/Grafana
2. **Add Testing:** Include unit tests and integration tests in pipeline
3. **Setup Staging:** Create separate staging environment
4. **Backup Strategy:** Implement regular backups for Jenkins and application data
5. **Documentation:** Document your deployment process for team members

---
 & Application
docker ps                           # List running containers
docker images                       # List Docker images
docker logs CONTAINER_NAME          # View container logs
docker compose logs                 # View all container logs
docker compose down                 # Stop all containers
docker compose up -d                # Start all containers
docker system prune -a              # Clean up unused Docker resources

# Check Jenkins logs
sudo journalctl -u jenkins -f
sudo tail -f /var/log/jenkins/jenkins.log

# Monitor application
cd /home/ubuntu/app
docker compose ps                   # Check container status
# Check logs
docker compose logs frontend
docker compose logs backend
docker compose logs mysql

# Or check specific container logs
docker logs <container-name>
sudo journalctl -u jenkins -f
sudo tail -f /var/log/jenkins/jenkins.log

# SSH to application server
ssh -i /var/lib/jenkins/.ssh/id_ryour existing EC2 instance at `http://YOUR_EC2_IP:8088`  
✅ **Application:** Running on the same server at `http://YOUR_EC2_IP:80`  
✅ **Docker:** Installed and configured for building images  
✅ **Credentials:** DockerHub configured  
✅ **Pipeline:** Automated CI/CD from GitHub push to local deployment  
✅ **Webhook:** GitHub triggers Jenkins automatically  
✅ **Cost Efficient:** Single server for both Jenkins and application

1. **Use Spot Instances:** Save up to 90% on EC2 costs
2. **Stop instances when not needed:** Stop development Jenkins during off-hours
3. **Right-size instances:** Monitor and adjust instance types
4. **Clean up resources:** Remove unused Docker images and containers
5. **Use Reserved Instances:** For production environments

---

## Support Resources

- **Jenkins Documentation:** https://www.jenkins.io/doc/
- **AWS EC2 Documentation:** https://docs.aws.amazon.com/ec2/
- **Docker Documentation:** https://docs.docker.com/
- **Ansible Documentation:** https://docs.ansible.com/

---

---

# APPROACH B: Jenkins on Local WSL with ngrok Tunneling

## Overview - Local Setup
This approach runs Jenkins locally on your Windows machine using WSL (Ubuntu) and exposes it to the internet using ngrok tunneling, allowing GitHub webhooks to trigger builds.

**Perfect for:**
- Learning and experimentation
- Development environments
- Students with limited budget
- Testing CI/CD pipelines

---

## Architecture Diagram - Local Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR WINDOWS PC                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              WSL (Ubuntu)                                 │  │
│  │                                                           │  │
│  │   ┌─────────────────┐        ┌──────────────────┐       │  │
│  │   │  Jenkins Server │◄───────┤  Docker Engine   │       │  │
│  │   │  localhost:8088 │        │                  │       │  │
│  │   └────────┬────────┘        └──────────────────┘       │  │
│  │            │                                              │  │
│  │            │                                              │  │
│  │   ┌────────▼────────┐                                    │  │
│  │   │  ngrok Tunnel   │                                    │  │
│  │   │  Port 8088      │                                    │  │
│  │   └────────┬────────┘                                    │  │
│  └────────────┼──────────────────────────────────────────────┘  │
└───────────────┼─────────────────────────────────────────────────┘
                │
                │ HTTPS Tunnel
                │
┌───────────────▼─────────────────────────────────────────────────┐
│              Internet (ngrok Cloud)                             │
│         https://abc123.ngrok.io → localhost:8088                │
└───────────────┬─────────────────────────────────────────────────┘
                │
                │ Webhook POST
                │
┌───────────────▼─────────────────────────────────────────────────┐
│                     GitHub Repository                           │
│              (Push Event) → Triggers Webhook                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Install Jenkins on WSL

### Step 1.1: Open WSL Terminal

```bash
# Open WSL Ubuntu (from Windows)
wsl
```

### Step 1.2: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 1.3: Install Java 17

```bash
# Install OpenJDK 17
sudo apt install openjdk-17-jdk -y

# Verify installation
java -version
```

### Step 1.4: Install Jenkins

```bash
# Add Jenkins repository key
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

# Add Jenkins repository
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Update package list
sudo apt update

# Install Jenkins
sudo apt install jenkins -y
```

### Step 1.5: Start Jenkins

```bash
# Start Jenkins
sudo systemctl start jenkins

# Enable Jenkins to start on boot
sudo systemctl enable jenkins

# Check status
sudo systemctl status jenkins
```

### Step 1.6: Get Initial Password

```bash
# Get the initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

**Copy this password** - you'll need it shortly.

### Step 1.7: Access Jenkins Locally

1. Open browser on Windows
2. Navigate to: `http://localhost:8088`
3. Paste the initial admin password
4. Click **Install suggested plugins**
5. Create admin user (username, password, email)
6. Keep Jenkins URL as `http://localhost:8088`
7. Click **Start using Jenkins**

---

## Part 2: Install Docker on WSL

### Step 2.1: Install Docker

```bash
# Install prerequisites
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io -y
```

### Step 2.2: Configure Docker for Jenkins

```bash
# Add Jenkins user to docker group
sudo usermod -aG docker jenkins

# Add your user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo service docker start

# Restart Jenkins
sudo systemctl restart jenkins

# Verify
sudo -u jenkins docker ps
```

---

## Part 3: Install and Configure ngrok

### Step 3.1: Install ngrok in WSL

**Method 1: Using Snap (Recommended)**
```bash
# Install snapd
sudo apt install snapd -y

# Install ngrok
sudo snap install ngrok
```

**Method 2: Manual Download**
```bash
# Download ngrok
cd ~
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz

# Extract
tar -xvzf ngrok-v3-stable-linux-amd64.tgz

# Move to system path
sudo mv ngrok /usr/local/bin/

# Verify installation
ngrok version
```

### Step 3.2: Sign Up for ngrok Account

1. Go to: https://ngrok.com
2. Click **Sign up** (free account)
3. Verify your email
4. Login to dashboard

### Step 3.3: Get Your Authtoken

1. In ngrok dashboard, go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your authtoken (looks like: `2abc...xyz`)

### Step 3.4: Authenticate ngrok in WSL

```bash
# Add your authtoken (replace with your actual token)
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE

# Example:
# ngrok config add-authtoken 2abc123def456ghi789jkl012mno345pqr
```

**Expected Output:**
```
Authtoken saved to configuration file: /home/username/.config/ngrok/ngrok.yml
```

---

## Part 4: Expose Jenkins Using ngrok

### Step 4.1: Start ngrok Tunnel

**In WSL terminal:**
```bash
# Expose Jenkins on port 8088
ngrok http 8088
```

**Expected Output:**
```
ngrok                                                                                                                                               
                                                                                                                                                    
Session Status                online
Account                       your-email@example.com (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:8088
                                                                                                                                                    
Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### Step 4.2: Note Your ngrok URL

**Copy the HTTPS URL** (example: `https://abc123def456.ngrok-free.app`)

**Important:**
- This URL changes every time you restart ngrok (free version)
- Keep the terminal running - closing it stops the tunnel
- You can view tunnel traffic at: `http://localhost:4040`

### Step 4.3: Update Jenkins URL

1. In Jenkins, go to: **Manage Jenkins** → **System**
2. Find **Jenkins URL**
3. Replace `http://localhost:8088` with your ngrok URL
4. Example: `https://abc123def456.ngrok-free.app`
5. Click **Save**

---

## Part 5: Install Required Jenkins Plugins

### Step 5.1: Navigate to Plugin Manager

1. Go to **Manage Jenkins** → **Plugins**
2. Click **Available plugins**

### Step 5.2: Install Plugins

Search and install (select all, then click **Install**):
- `Git`
- `GitHub`
- `Pipeline`
- `Docker Pipeline`
- `Docker`
- `Credentials Binding`

**After installation:** Restart Jenkins (checkbox will appear)

---

## Part 6: Configure DockerHub Credentials

### Step 6.1: Add DockerHub Credentials

1. Go to **Manage Jenkins** → **Credentials**
2. Click **(global)** → **Add Credentials**
3. Configure:
   - **Kind:** Username with password
   - **Scope:** Global
   - **Username:** your_dockerhub_username
   - **Password:** your_dockerhub_password
   - **ID:** `dockerhub-credentials`
   - **Description:** DockerHub Login
4. Click **Create**

---

## Part 7: Configure GitHub Webhook

### Step 7.1: Get Jenkins Webhook URL

Your Jenkins webhook URL format:
```
https://YOUR_NGROK_URL/github-webhook/
```

**Example:**
```
https://abc123def456.ngrok-free.app/github-webhook/
```

**Important:** Don't forget the trailing slash `/`

### Step 7.2: Add Webhook in GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - **Payload URL:** `https://YOUR_NGROK_URL/github-webhook/`
   - **Content type:** `application/json`
   - **Secret:** Leave empty
   - **Which events:** Select "Just the push event"
   - **Active:** ✅ Check
4. Click **Add webhook**

### Step 7.3: Test Webhook

1. After adding, GitHub will send a test ping
2. Check webhook status (should show ✅ green checkmark)
3. If failed, check:
   - ngrok tunnel is running
   - URL has `/github-webhook/` at the end
   - Jenkins URL is updated with ngrok URL

---

## Part 8: Create Jenkins Pipeline Job

### Step 8.1: Create Pipeline

1. Jenkins Dashboard → **New Item**
2. Name: `devops-local-pipeline`
3. Type: **Pipeline**
4. Click **OK**

### Step 8.2: Configure Pipeline

**General Section:**
- ✅ Check **GitHub project**
- Project URL: `https://github.com/YOUR_USERNAME/YOUR_REPO`

**Build Triggers:**
- ✅ Check **GitHub hook trigger for GITScm polling**

**Pipeline Section:**
- **Definition:** Pipeline script from SCM
- **SCM:** Git
- **Repository URL:** `https://github.com/YOUR_USERNAME/YOUR_REPO.git`
- **Credentials:** None (for public repos)
- **Branch Specifier:** `*/main`
- **Script Path:** `Jenkinsfile`

Click **Save**

---

## Part 9: Create Jenkinsfile (Local Build)

Create `Jenkinsfile` in your project root:

```groovy
pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'YOUR_DOCKERHUB_USERNAME'
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/devops-frontend"
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/devops-backend"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code from GitHub...'
                checkout scm
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo '🏗️  Building Frontend Docker Image...'
                dir('frontend') {
                    sh '''
                        docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} .
                        docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER} ${FRONTEND_IMAGE}:latest
                    '''
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                echo '🏗️  Building Backend Docker Image...'
                dir('backend') {
                    sh '''
                        docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} .
                        docker tag ${BACKEND_IMAGE}:${BUILD_NUMBER} ${BACKEND_IMAGE}:latest
                    '''
                }
            }
        }
        
        stage('Push to DockerHub') {
            steps {
                echo '📤 Pushing images to DockerHub...'
                sh '''
                    echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                    docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                    docker push ${FRONTEND_IMAGE}:latest
                    docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                    docker push ${BACKEND_IMAGE}:latest
                '''
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up...'
            sh 'docker logout'
        }
        success {
            echo '✅ Build successful!'
            echo "Frontend: ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
            echo "Backend: ${BACKEND_IMAGE}:${BUILD_NUMBER}"
        }
        failure {
            echo '❌ Build failed!'
        }
    }
}
```

**Update:** Replace `YOUR_DOCKERHUB_USERNAME` with your actual username.

---

## Part 10: Test the Complete Setup

### Step 10.1: Manual Build Test

1. In Jenkins → Click your pipeline
2. Click **Build Now**
3. Monitor **Console Output**
4. Wait for completion

### Step 10.2: Webhook Trigger Test

1. Make a change in your code:
```bash
# In your project directory
echo "# Test webhook" >> README.md
git add .
git commit -m "Test Jenkins webhook"
git push origin main
```

2. **Check Jenkins:**
   - Build should start automatically within seconds
   - Monitor build progress

3. **Check GitHub:**
   - Go to **Settings** → **Webhooks**
   - Click on your webhook
   - Check **Recent Deliveries**
   - Should show 200 OK response

---

## Part 11: Common Errors and Solutions

### Error 1: ngrok Tunnel Not Working

**Symptoms:** Webhook fails, can't access Jenkins via ngrok URL

**Solutions:**
```bash
# Check if ngrok is running
ps aux | grep ngrok

# Check ngrok web interface
curl http://localhost:4040/api/tunnels

# Restart ngrok
pkill ngrok
ngrok http 8088
```

### Error 2: "Permission Denied" - Docker

**Symptoms:** Build fails with Docker permission errors

**Solutions:**
```bash
# Add jenkins to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Restart Docker
sudo service docker restart

# Verify
sudo -u jenkins docker ps
```

### Error 3: Jenkins URL Mismatch

**Symptoms:** Webhook returns 302 or 404

**Solutions:**
1. Update Jenkins URL: **Manage Jenkins** → **System** → **Jenkins URL**
2. Use exact ngrok URL (with https)
3. Update GitHub webhook with new URL

### Error 4: "No suitable docker was found"

**Symptoms:** Build fails finding Docker

**Solutions:**
```bash
# Install Docker if not present
sudo apt install docker.io -y

# Check Docker in Jenkins
sudo -u jenkins which docker

# Add Docker to PATH in Jenkins
# Manage Jenkins → System → Global properties → Environment variables
# Add: PATH = /usr/bin:/usr/local/bin
```

### Error 5: Webhook 403 Forbidden

**Symptoms:** GitHub webhook shows 403 error

**Solutions:**
1. Check Jenkins CSRF protection
   - **Manage Jenkins** → **Security** → **CSRF Protection**
   - Uncheck "Prevent Cross Site Request Forgery exploits" (for testing only)
2. Or configure webhook secret in Jenkins

### Error 6: ngrok "Too Many Connections" (Free Tier)

**Symptoms:** ngrok stops working

**Solutions:**
- Free tier has connection limits
- Restart ngrok tunnel
- Upgrade to paid plan for production use

### Error 7: WSL Docker Service Not Starting

**Symptoms:** `docker: Cannot connect to the Docker daemon`

**Solutions:**
```bash
# Start Docker service
sudo service docker start

# If fails, try:
sudo dockerd &

# Add to WSL startup
echo "sudo service docker start" >> ~/.bashrc
```

---

## Part 12: Security Best Practices

### 12.1: ngrok Security

⚠️ **Important Warnings:**
1. **Never expose production systems via ngrok free tier**
2. **Your Jenkins is publicly accessible** - use strong passwords
3. **ngrok URLs are temporary** - not for production

**Best Practices:**
```bash
# Use ngrok with authentication (paid feature)
ngrok http 8088 --basic-auth="username:password"

# Use IP restrictions (paid feature)
ngrok http 8088 --cidr-allow="YOUR_IP/32"
```

### 12.2: Jenkins Security

1. **Strong Admin Password**
   - Use complex passwords (16+ characters)
   - Enable 2FA if possible

2. **Limit Script Execution**
   - **Manage Jenkins** → **Security** → **In-process Script Approval**
   - Review all scripts before approval

3. **User Permissions**
   - Create limited users for team members
   - Use role-based access control

4. **Update Regularly**
```bash
# Update Jenkins
sudo apt update
sudo apt upgrade jenkins -y
```

### 12.3: Credentials Management

1. **Never commit credentials** to Git
2. Use Jenkins credentials store only
3. Use environment variables for secrets

---

## Part 13: Keeping ngrok Running

### Option 1: Run ngrok in Background

```bash
# Start ngrok in background
nohup ngrok http 8088 > /dev/null 2>&1 &

# Check if running
ps aux | grep ngrok

# Kill when needed
pkill ngrok
```

### Option 2: Use Screen or tmux

```bash
# Install screen
sudo apt install screen -y

# Start screen session
screen -S ngrok

# Run ngrok
ngrok http 8088

# Detach: Press Ctrl+A then D

# Reattach later
screen -r ngrok
```

### Option 3: Create systemd Service (Advanced)

```bash
# Create service file
sudo nano /etc/systemd/system/ngrok.service
```

**Content:**
```ini
[Unit]
Description=ngrok tunnel
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
ExecStart=/usr/local/bin/ngrok http 8088
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl enable ngrok
sudo systemctl start ngrok

# Check status
sudo systemctl status ngrok
```

---

## Part 14: Verification Checklist

### ✅ Pre-Flight Checklist

- [ ] WSL installed and working
- [ ] Jenkins running on `http://localhost:8088`
- [ ] Docker installed and accessible by Jenkins user
- [ ] ngrok installed and authenticated
- [ ] ngrok tunnel running and showing HTTPS URL
- [ ] Jenkins URL updated with ngrok URL
- [ ] DockerHub credentials added to Jenkins
- [ ] GitHub repository ready
- [ ] Jenkinsfile present in repository root

### ✅ Configuration Checklist

- [ ] Required Jenkins plugins installed
- [ ] Pipeline job created in Jenkins
- [ ] GitHub webhook configured with correct URL
- [ ] Webhook has green checkmark (test successful)
- [ ] Pipeline connected to GitHub repository
- [ ] Branch specifier matches your branch name

### ✅ Testing Checklist

- [ ] Manual build works (Build Now)
- [ ] Docker images build successfully
- [ ] Images pushed to DockerHub
- [ ] Git push triggers automatic build
- [ ] Webhook delivery shows 200 OK
- [ ] Build notifications visible in Jenkins

### ✅ Maintenance Checklist

- [ ] ngrok tunnel stays running
- [ ] Jenkins service auto-starts
- [ ] Docker service auto-starts
- [ ] Regular backups of Jenkins data
- [ ] Regular plugin updates

---

## Part 15: Quick Reference Commands

### Jenkins Commands

```bash
# Start Jenkins
sudo systemctl start jenkins

# Stop Jenkins
sudo systemctl stop jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Check status
sudo systemctl status jenkins

# View logs
sudo journalctl -u jenkins -f
```

### Docker Commands

```bash
# Start Docker
sudo service docker start

# Check Docker status
sudo service docker status

# List containers
docker ps

# List images
docker images

# Clean up
docker system prune -a
```

### ngrok Commands

```bash
# Start ngrok tunnel
ngrok http 8088

# Background mode
nohup ngrok http 8088 &

# Check running tunnels
curl http://localhost:4040/api/tunnels

# Kill ngrok
pkill ngrok
```

### Debugging Commands

```bash
# Check Jenkins can use Docker
sudo -u jenkins docker ps

# Check ngrok is running
ps aux | grep ngrok

# Test webhook manually (from WSL)
curl -X POST https://YOUR_NGROK_URL/github-webhook/

# Check open ports
sudo netstat -tulpn | grep LISTEN

# Check disk space
df -h

# Check memory
free -h
```

---

## Part 16: Comparison Summary

### When to Use Local WSL + ngrok:

✅ **Learning CI/CD concepts**  
✅ **Testing pipeline configurations**  
✅ **Personal projects**  
✅ **Limited budget**  
✅ **Short-term use**  

### When to Use AWS EC2:

✅ **Production deployments**  
✅ **Team collaboration**  
✅ **24/7 availability required**  
✅ **Stable URLs needed**  
✅ **Multiple concurrent builds**  

---

## Part 17: Troubleshooting ngrok Free Tier Limitations

### Limitation 1: URL Changes on Restart

**Problem:** ngrok URL changes every time you restart

**Solutions:**
1. **Paid ngrok plan:** Get static domain
2. **Update workflow:**
   ```bash
   # Get new URL
   curl http://localhost:4040/api/tunnels | grep public_url
   
   # Update Jenkins URL manually
   # Update GitHub webhook manually
   ```

### Limitation 2: Session Timeout

**Problem:** Free tier has connection limits

**Solutions:**
- Restart ngrok periodically
- Don't leave unused tunnels running
- Consider paid plan for serious use

### Limitation 3: 40 connections/minute Limit

**Problem:** Heavy webhook traffic fails

**Solutions:**
- Throttle builds
- Use polling as backup
- Upgrade to paid plan

---

## Useful Resources

**ngrok:**
- Documentation: https://ngrok.com/docs
- Dashboard: https://dashboard.ngrok.com

**Jenkins:**
- Documentation: https://www.jenkins.io/doc/
- Plugins: https://plugins.jenkins.io/

**GitHub Webhooks:**
- Documentation: https://docs.github.com/webhooks

**WSL:**
- Documentation: https://learn.microsoft.com/windows/wsl/

---

**Author:** DevOps Team  
**Last Updated:** January 2026  
**Version:** 2.0 (Added Local WSL Setup)