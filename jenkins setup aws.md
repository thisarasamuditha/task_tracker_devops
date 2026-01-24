# Jenkins CI/CD Setup Guide - Complete Step-by-Step

## Overview
This guide provides **TWO approaches** for setting up Jenkins for your CI/CD pipeline:

**Approach A:** Jenkins on AWS EC2 (Production - 24/7 cloud server)  
**Approach B:** Jenkins on Local WSL with ngrok (Development/Learning - Free)

Choose the approach that fits your needs.

---

## Approach Comparison

| Feature | AWS EC2 | Local WSL + ngrok |
|---------|---------|-------------------|
| **Cost** | ~$15-30/month | Free (ngrok free tier) |
| **Availability** | 24/7 | Only when PC is on |
| **Performance** | High | Depends on local PC |
| **Setup Complexity** | Medium | Low |
| **Use Case** | Production | Learning/Development |
| **Public Access** | Yes | Yes (via ngrok) |
| **IP Changes** | Stable | Changes on restart |

---

# APPROACH A: Jenkins on AWS EC2

## Prerequisites
- Existing AWS EC2 instance with your application
- Ubuntu 22.04 LTS or similar Linux distribution
- At least 2 GB RAM (t3.small, t3.medium, or larger)
- Basic knowledge of Linux commands
- SSH access to your EC2 instance
- DockerHub account (for pushing images)
- Existing SSH key pair for your instance

---

## Part 1: Prepare Your Existing EC2 Instance

### Step 1.1: Update Security Group

1. **Login to AWS Console**
   - Go to https://console.aws.amazon.com
   - Navigate to **EC2 Dashboard**

2. **Update Security Group for Your Instance**
   - Click on your running instance
   - Go to **Security** tab
   - Click on the security group link
   - Click **Edit inbound rules**
   - **Add the following rule:**

   | Type | Protocol | Port | Source | Description |
   |------|----------|------|--------|-------------|
   | Custom TCP | TCP | 8088 | 0.0.0.0/0 | Jenkins Web UI |

   - Click **Save rules**

**Note:** Your existing rules for ports 80 (HTTP), 8088 (Backend), and 22 (SSH) should remain unchanged.

### Step 1.2: Connect to Your EC2 Instance

**Connect using your existing SSH key:**

```bash
# Navigate to your key location
cd terraform  # or wherever your key is stored

# Set permissions (if not already set)
chmod 400 devops-key

# Connect to your existing instance
ssh -i devops-key ubuntu@YOUR_EC2_PUBLIC_IP
```

**For Windows PowerShell:**
```powershell
# Navigate to key location
cd terraform

# Connect
ssh -i devops-key ubuntu@YOUR_EC2_PUBLIC_IP
```

---
Your Existing EC2 Instance

### Step 2.1: Update System

**Important:** If your application is currently running, this installation won't affect it.

### Step 2.1: Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2.2: Install Java (Jenkins Requirement)
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

# Update package list
sudo apt update

# Install Jenkins
sudo apt install jenkins -y
```

### Step 2.4: Start Jenkins Service
```bash
# Start Jenkins
sudo systemctl start jenkins

# Enable Jenkins to start on boot
sudo systemctl enable jenkins

# Check Jenkins status
sudo systemctl status jenkins
```

**Expected Output:**
```
● jenkins.service - Jenkins Continuous Integration Server
     Loaded: loaded (/lib/systemd/system/jenkins.service; enabled)
     Active: active (running)
```Verify or Install Docker

### Step 3.1: Check if Docker is Already Installed

```bash
# Check Docker version
docker --version
```

**If Docker is already installed**, you'll see the version. Skip to Step 3.2.

**If Docker is NOT installed**, run these commands:


## Part 3: Install Docker on Jenkins Server

### Step 3.1: Install Docker
```bash
# Install prerequisites
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update and install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io -y

# Verify Docker installation
docker --version
```

### Step 3.2: Configure Docker for Jenkins
```bash
# Add Jenkins user to docker group
sudo usermod -aG docker jenkins

# Add ubuntu user to docker group (optional)
sudo usermod -aG docker $USER

# Restart Jenkins
sudo systemctl restart jenk(Optional for Same-Server Deployment)

**Note:** Since Jenkins and your application are on the same server, Ansible is optional. You can deploy directly using Docker commands. However, we'll install it for consistency.

# Verify Jenkins can use Docker
sudo -u jenkins docker ps
```

**Expected Output:** (empty list is fine)
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

---

## Part 4: Install Ansible on Jenkins Server

```bash
# Install Ansible
sudo apt install ansible -y

# Verify installation
ansible --version
```

**Expected Output:**
```
ansible [core 2.x.x]
```

---

## Part 5: Access and Configure Jenkins

### Step 5.1: Access Jenkins Web Interface

1. Open browser and navigate to:
   ```
   http://YOUR_EC2_PUBLIC_IP:8088
   ```

2. **Unlock Jenkins:**
   - You'll see "Unlock Jenkins" page
   - Get the initial admin password:
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
   - Copy the password and paste it into the browser

3. **Install Suggested Plugins:**
   - Click **Install suggested plugins**
   - Wait for installation to complete (5-10 minutes)

4. **Create First Admin User:**
   - Username: `admin` (or your choice)
   - Password: Create a strong password
   - Full name: Your name
   - Email: Your email
   - Click **Save and Continue**

5. **Instance Configuration:**
   - Jenkins URL: `http://YOUR_EC2_PUBLIC_IP:8088/`
   - Click **Save and Finish**
   - Click **Start using Jenkins**

### Step 5.2: Install Required Jenkins Plugins

1. **Navigate to Plugin Manager:**
   - Go to **Manage Jenkins** → **Manage Plugins**
   - Click on **Available plugins** tab

2. **Install the following plugins:**
   - Search and select each plugin, then click **Install without restart**

   **Required Plugins:**
   - `Docker Pipeline`
   - `Docker`
   - `Git`
   - `GitHub`
   - `Pipeline`
   - `SSH Agent`
   - `Credentials Binding`
   - `Ansible`

3. **Restart Jenkins:**
   ```bash
   sudo systemctl restart jenkins
   ```

---

## Part 6: Configure Jenkins Credentials

### Step 6.1: Add DockerHub Credentials

1. **Navigate to Credentials:**
   - Go to **Manage Jenkins** → **Credentials**
   - Click on Setup Local Deployment (Jenkins and App on Same Server)

Since Jenkins and your application are on the same server, we don't need SSH keys for deployment. Jenkins will deploy directly using Docker commands.

**Skip SSH key generation** - not needed for same-server deployment.
   - Paste the entire private key (including BEGIN and END lines)
   - Click **Create**

### Step 6.3: Add EC2 IP Address

1. **Add Secret Text:**
   - **Kind:** Secret text
   - **Scope:** Global
   - **Secret:** Your application server public IP (e.g., `54.123.45.67`)
   - **ID:** `ec2-ip`
   - **Description:** Application Server IP
   - Click **Create**

---

## Part 7: Configure GitHub Webhook

### Step 7.1: Generate Jenkins API Token

1. **In Jenkins:**
   - Click on your username (top right)
   - Click **Configure**
   - Scroll to **API Token**
   - Click **Add new Token**
   - Name: `github-webhook`
   - Click **Generate**
   - **Copy the token** (you won't see it again)

### Step 7.2: Setup GitHub Webhook

1. **In GitHub Repository:**
   - Go to your repository
   - Click **Settings** → **Webhooks**
   - Click **Add webhook**

2. **Configure Webhook:**
   - **Payload URL:** `http://YOUR_JENKINS_IP:8088/github-webhook/`
   - **Content type:** `application/json`
   - **Secret:** Leave empty (or use Jenkins token)
   - **Which events:** Select "Just the push event"
   - **Active:** Check
   - Click **Add webhook**

---

## Part 8: Create Jenkins Pipeline Job

### Step 8.1: Create New Pipeline

1. **In Jenkins Dashboard:**
   - Click **New Item**
   - **Name:** `devops-project-pipeline`
   - **Type:** Select **Pipeline**
   - Click **OK**

### Step 8.2: Configure Pipeline

1. **General Settings:**
   - ☑ **GitHub project**
   - Project url: `https://github.com/YOUR_USERNAME/YOUR_REPO`

2. **Build Triggers:**
   - ☑ **GitHub hook trigger for GITScm polling**

3. **Pipeline Configuration:**
   - **Definition:** Pipeline script from SCM
   - **SCM:** Git
   - **Repository URL:** `https://github.com/YOUR_USERNAME/YOUR_REPO.git`
   - **Credentials:** None (for public repos) or add GitHub credentials
   - **Branch:** `*/main` (or your branch name)
   - **Script Path:** `Jenkinsfile`

4. **Click Save**

---

## Part 9: Create Jenkinsfile

### Step 9.1: Create Jenkinsfile in Your Project Root

Create a file named `Jenkinsfile` in your project root directory:

```groovy
pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'YOUR_DOCKERHUB_USERNAME'
        EC2_IP = credentials('ec2-ip')
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/devops-frontend"
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/devops-backend"
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