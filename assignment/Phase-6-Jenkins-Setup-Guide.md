# Jenkins Setup Guide - Phase 6

## Where is Jenkins Server?

**Jenkins runs locally on your machine:**
- **URL:** `http://localhost:8080` (default port)
- **Installation:** On your Windows machine or WSL Ubuntu

---

## Step-by-Step Jenkins Installation & Configuration

### Option 1: Install Jenkins on WSL Ubuntu (Recommended)

#### 1. Install Java 17
```bash
sudo apt update
sudo apt install openjdk-17-jdk -y
java -version
```

#### 2. Install Jenkins
```bash
# Add Jenkins repository key
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

# Add Jenkins repository
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt update
sudo apt install jenkins -y
```

#### 3. Start Jenkins
```bash
sudo systemctl start jenkins
sudo systemctl enable jenkins
sudo systemctl status jenkins
```

#### 4. Get Initial Admin Password
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

#### 5. Access Jenkins
- Open browser: `http://localhost:8080`
- Enter the initial admin password
- Install suggested plugins
- Create first admin user

---

### 6.1 Prepare Jenkins Environment

#### Add Jenkins User to Docker Group
```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Verify Jenkins can use Docker
sudo -u jenkins docker ps
```

#### Install Ansible
```bash
sudo apt install ansible -y

# Verify Ansible
sudo -u jenkins ansible --version
```

#### Install Git (if not installed)
```bash
sudo apt install git -y
```

---

### 6.2 Configure Jenkins Credentials

Access Jenkins at `http://localhost:8080`

#### A. DockerHub Credentials
1. Navigate: **Manage Jenkins → Credentials → System → Global credentials**
2. Click **Add Credentials**
3. Configure:
   - **Kind:** Username with password
   - **Username:** `your_dockerhub_username`
   - **Password:** `your_dockerhub_password`
   - **ID:** `dockerhub-credentials`
   - **Description:** DockerHub Login
4. Click **Create**

#### B. EC2 SSH Key
1. Click **Add Credentials** again
2. Configure:
   - **Kind:** SSH Username with private key
   - **ID:** `ec2-ssh-key`
   - **Description:** EC2 SSH Access
   - **Username:** `ubuntu`
   - **Private Key:** Select "Enter directly"
   - Paste the contents of `terraform/devops-key` (private key)
3. Click **Create**

**To get the private key content:**
```bash
cat terraform/devops-key
```

#### C. EC2 IP Address
1. Click **Add Credentials** again
2. Configure:
   - **Kind:** Secret text
   - **Secret:** Your EC2 public IP (from Terraform output)
   - **ID:** `ec2-ip`
   - **Description:** EC2 Public IP
3. Click **Create**

**To get EC2 IP from Terraform:**
```bash
cd terraform
terraform output instance_public_ip
```

---

### 6.3 Update Jenkinsfile

Update the DockerHub username in your Jenkinsfile:

**File:** `Jenkinsfile` (line 6)

Change:
```groovy
DOCKER_USERNAME = 'YOUR_DOCKERHUB_USERNAME'
```

To:
```groovy
DOCKER_USERNAME = 'your_actual_dockerhub_username'
```

---

### 6.4 Create Jenkins Pipeline Job

#### Step 1: Create New Pipeline
1. Open Jenkins Dashboard: `http://localhost:8080`
2. Click **New Item**
3. Configure:
   - **Name:** `devops-project-pipeline`
   - **Type:** Select **Pipeline**
   - Click **OK**

#### Step 2: Configure Pipeline
1. **General Section:**
   - Description: `CI/CD Pipeline for DevOps Project`
   - ✅ Check **GitHub project** (optional)
   - Project URL: `https://github.com/your-username/your-repo/`

2. **Build Triggers:**
   - ✅ Check **GitHub hook trigger for GITScm polling** (for webhook automation)
   - OR ✅ Check **Poll SCM** with schedule: `H/5 * * * *` (check every 5 minutes)

3. **Pipeline Section:**
   - **Definition:** Select **Pipeline script from SCM**
   - **SCM:** Select **Git**
   - **Repository URL:** `https://github.com/your-username/your-repo.git`
   - **Credentials:** (Leave as "none" for public repos, or add GitHub credentials)
   - **Branches to build:** `*/main` (or `*/master` depending on your branch)
   - **Script Path:** `Jenkinsfile`

4. Click **Save**

#### Step 3: Run Pipeline
1. Click **Build Now**
2. Monitor the pipeline execution
3. Check console output for each stage

---

### 6.5 Configure GitHub Webhook (Optional - for Auto-Trigger)

#### In GitHub Repository:
1. Go to your repository: `Settings → Webhooks → Add webhook`
2. Configure:
   - **Payload URL:** `http://YOUR_PUBLIC_IP:8080/github-webhook/`
   - **Content type:** `application/json`
   - **Events:** Select "Just the push event"
   - **Active:** ✅ Check
3. Click **Add webhook**

**Note:** For localhost Jenkins, you'll need:
- Expose Jenkins using ngrok: `ngrok http 8080`
- Use the ngrok URL for webhook
- OR deploy Jenkins on a public server

---

## Verification Checklist

### ✅ Jenkins Installation
- [ ] Jenkins installed and running
- [ ] Accessible at `http://localhost:8080`
- [ ] Initial setup completed
- [ ] Admin user created

### ✅ Jenkins Environment
- [ ] Jenkins user added to docker group
- [ ] Docker accessible: `sudo -u jenkins docker ps`
- [ ] Ansible installed: `sudo -u jenkins ansible --version`
- [ ] Git installed

### ✅ Jenkins Credentials
- [ ] DockerHub credentials (`dockerhub-credentials`)
- [ ] EC2 SSH key (`ec2-ssh-key`)
- [ ] EC2 IP address (`ec2-ip`)

### ✅ Pipeline Configuration
- [ ] Jenkinsfile updated with DockerHub username
- [ ] Pipeline job created: `devops-project-pipeline`
- [ ] Pipeline connected to GitHub repository
- [ ] First build successful

### ✅ Deployment
- [ ] Docker images built successfully
- [ ] Images pushed to DockerHub
- [ ] Ansible deployed to EC2
- [ ] Application accessible on EC2

---

## Troubleshooting

### Issue: Permission denied for Docker
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue: Ansible not found
```bash
sudo apt install ansible -y
sudo -u jenkins ansible --version
```

### Issue: SSH connection failed
- Verify EC2 security group allows SSH (port 22)
- Check private key format in Jenkins credentials
- Verify EC2 IP is correct

### Issue: Build fails at Docker stage
- Check Docker is running: `docker ps`
- Verify Jenkins user has Docker permissions
- Check Dockerfile syntax

---

## Pipeline Stages Overview

1. **Checkout:** Pull code from GitHub
2. **Build Backend:** Create Spring Boot Docker image
3. **Build Frontend:** Create React Docker image
4. **Push Images:** Upload to DockerHub
5. **Update docker-compose:** Replace placeholders
6. **Deploy to EC2:** Run Ansible playbook

---

## Useful Jenkins Commands

```bash
# Start Jenkins
sudo systemctl start jenkins

# Stop Jenkins
sudo systemctl stop jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Check Jenkins status
sudo systemctl status jenkins

# View Jenkins logs
sudo journalctl -u jenkins -f

# Change Jenkins port (if 8080 is occupied)
sudo nano /etc/default/jenkins
# Change HTTP_PORT=8080 to HTTP_PORT=8088
sudo systemctl restart jenkins
```

---

## Next Steps After Phase 6

1. **Test the complete pipeline:** Push code to GitHub and watch Jenkins auto-build
2. **Configure monitoring:** Set up email notifications for build failures
3. **Add testing stages:** Include unit tests, integration tests
4. **Implement blue-green deployment:** For zero-downtime updates
5. **Add security scanning:** Integrate Trivy or SonarQube

---

✅ **Phase 6 Complete when:**
- Jenkins is running and accessible
- All credentials configured correctly
- Pipeline job created and linked to GitHub
- First successful pipeline execution
- Application deployed to EC2 via Jenkins
