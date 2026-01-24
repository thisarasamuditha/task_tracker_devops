# Jenkins Setup on AWS EC2 - Complete Step-by-Step Guide

## Overview
This guide will help you set up Jenkins on an AWS EC2 instance for automating your CI/CD pipeline. Jenkins will run 24/7 on the cloud, eliminating the need to keep your local machine running.

---

## Prerequisites
- AWS Account with EC2 access
- Basic knowledge of Linux commands
- SSH client installed on your local machine
- DockerHub account (for pushing images)

---

## Part 1: Launch AWS EC2 Instance for Jenkins

### Step 1.1: Launch EC2 Instance

1. **Login to AWS Console**
   - Go to https://console.aws.amazon.com
   - Navigate to **EC2 Dashboard**

2. **Launch New Instance**
   - Click **Launch Instance**
   - **Name:** `jenkins-server`
   - **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type:** `t3.medium` (Recommended) or `t2.medium`
     - **Note:** Jenkins needs at least 2 GB RAM, so `t2.micro` is NOT sufficient
   - **Key Pair:** 
     - Click **Create new key pair**
     - Name: `jenkins-key`
     - Type: RSA
     - Format: `.pem` (for Mac/Linux) or `.ppk` (for Windows/PuTTY)
     - Download and save securely

3. **Configure Security Group**
   - Create security group named: `jenkins-sg`
   - Add the following rules:

   | Type | Protocol | Port | Source | Description |
   |------|----------|------|--------|-------------|
   | SSH | TCP | 22 | Your IP | SSH access |
   | Custom TCP | TCP | 8080 | 0.0.0.0/0 | Jenkins Web UI |
   | HTTP | TCP | 80 | 0.0.0.0/0 | Optional |
   | HTTPS | TCP | 443 | 0.0.0.0/0 | Optional |

4. **Configure Storage**
   - Root volume: **30 GB** gp3 (minimum 20 GB recommended)

5. **Launch Instance**
   - Click **Launch Instance**
   - Wait for instance state to become **Running**
   - Note down the **Public IP address**

### Step 1.2: Connect to Jenkins Server

**For Windows (using Git Bash or PowerShell):**
```bash
# Navigate to key location
cd ~/Downloads

# Set permissions
chmod 400 jenkins-key.pem

# Connect
ssh -i jenkins-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

**For Mac/Linux:**
```bash
# Set permissions
chmod 400 ~/Downloads/jenkins-key.pem

# Connect
ssh -i ~/Downloads/jenkins-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## Part 2: Install Jenkins on EC2

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
```

---

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
sudo systemctl restart jenkins

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
   http://YOUR_EC2_PUBLIC_IP:8080
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
   - Jenkins URL: `http://YOUR_EC2_PUBLIC_IP:8080/`
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
   - Click on **(global)** domain
   - Click **Add Credentials**

2. **DockerHub Credentials:**
   - **Kind:** Username with password
   - **Scope:** Global
   - **Username:** Your DockerHub username
   - **Password:** Your DockerHub password
   - **ID:** `dockerhub-credentials`
   - **Description:** DockerHub Login
   - Click **Create**

### Step 6.2: Add EC2 SSH Key (Application Deployment Server)

1. **Generate SSH Key on Jenkins Server:**
   ```bash
   # Switch to jenkins user
   sudo su - jenkins

   # Generate SSH key (press Enter for all prompts)
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa

   # Display public key
   cat ~/.ssh/id_rsa.pub
   ```

2. **Copy Public Key to Application EC2 Instance:**
   ```bash
   # Exit from jenkins user
   exit

   # Copy the public key to your application server
   ssh-copy-id -i /var/lib/jenkins/.ssh/id_rsa.pub ubuntu@YOUR_APP_SERVER_IP
   ```

   **Or manually:**
   - Copy the public key content
   - SSH into your application server
   - Append to `~/.ssh/authorized_keys`:
   ```bash
   echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

3. **Add SSH Credentials in Jenkins:**
   - Go to **Manage Jenkins** → **Credentials** → **Add Credentials**
   - **Kind:** SSH Username with private key
   - **Scope:** Global
   - **ID:** `ec2-ssh-key`
   - **Description:** EC2 SSH Key
   - **Username:** `ubuntu`
   - **Private Key:** Enter directly
     ```bash
     # Get private key
     sudo cat /var/lib/jenkins/.ssh/id_rsa
     ```
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
   - **Payload URL:** `http://YOUR_JENKINS_IP:8080/github-webhook/`
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
        
        stage('Deploy to EC2') {
            steps {
                echo 'Deploying to EC2 using SSH...'
                sshagent(['ec2-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_IP} '
                            cd /home/ubuntu/app || mkdir -p /home/ubuntu/app
                            
                            # Pull latest images
                            docker pull ${FRONTEND_IMAGE}:latest
                            docker pull ${BACKEND_IMAGE}:latest
                            
                            # Stop and remove old containers
                            docker compose down || true
                            
                            # Start new containers
                            docker compose up -d
                            
                            # Show running containers
                            docker ps
                        '
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up...'
            sh 'docker logout'
        }
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
```

### Step 9.2: Update Jenkinsfile
- Replace `YOUR_DOCKERHUB_USERNAME` with your actual DockerHub username
- Commit and push to GitHub:
```bash
git add Jenkinsfile
git commit -m "Add Jenkinsfile for CI/CD"
git push origin main
```

---

## Part 10: Test the Pipeline

### Step 10.1: Manual Build

1. **In Jenkins Dashboard:**
   - Click on `devops-project-pipeline`
   - Click **Build Now**
   - Watch the build progress in **Console Output**

### Step 10.2: Automatic Build (Webhook Test)

1. **Make a change in your code:**
   ```bash
   # Edit any file
   git add .
   git commit -m "Test Jenkins webhook"
   git push origin main
   ```

2. **Check Jenkins:**
   - Build should start automatically
   - Monitor in Jenkins Dashboard

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
   sudo nano /etc/default/jenkins
   # Change HTTP_PORT=8080 to HTTP_PORT=9090
   sudo systemctl restart jenkins
   ```

2. **Enable HTTPS:**
   - Install SSL certificate (Let's Encrypt)
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

✅ **Jenkins Server:** Running on AWS EC2 at `http://YOUR_JENKINS_IP:8080`  
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

## Useful Commands

```bash
# Jenkins Service
sudo systemctl start jenkins
sudo systemctl stop jenkins
sudo systemctl restart jenkins
sudo systemctl status jenkins

# Docker
docker ps
docker images
docker logs CONTAINER_ID
docker system prune -a

# Check Jenkins logs
sudo journalctl -u jenkins -f
sudo tail -f /var/log/jenkins/jenkins.log

# SSH to application server
ssh -i /var/lib/jenkins/.ssh/id_rsa ubuntu@YOUR_APP_SERVER_IP
```

---

## Cost Optimization Tips

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

**Author:** DevOps Team  
**Last Updated:** January 2026  
**Version:** 1.0