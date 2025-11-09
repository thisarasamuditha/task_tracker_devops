# Jenkins CI/CD Pipeline Setup Guide

## Overview

This guide will help you set up a complete CI/CD pipeline using Jenkins on WSL to automate the build, test, and deployment process for the Task Tracker application.

## Architecture Flow

```
Developer → GitHub → Jenkins (WSL) → Docker Build → DockerHub → Deployment
```

---

## Prerequisites

### 1. Install Jenkins on WSL

```bash
# Update package list
sudo apt update

# Install Java (Jenkins requirement)
sudo apt install openjdk-17-jdk -y

# Verify Java installation
java -version

# Add Jenkins repository key
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

# Add Jenkins repository
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Update package list again
sudo apt update

# Install Jenkins
sudo apt install jenkins -y

# Start Jenkins service
sudo systemctl start jenkins

# Enable Jenkins to start on boot
sudo systemctl enable jenkins

# Check Jenkins status
sudo systemctl status jenkins
```

### 2. Access Jenkins

1. Open your browser and navigate to: `http://localhost:8080`
2. Get the initial admin password:
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
3. Copy the password and paste it in the browser
4. Click "Install suggested plugins"
5. Create your first admin user
6. Configure Jenkins URL (keep default: `http://localhost:8080`)

---

## Required Jenkins Plugins

Install these plugins via: **Manage Jenkins** → **Manage Plugins** → **Available**

### Essential Plugins:

1. **Git Plugin** - For GitHub integration
2. **Pipeline Plugin** - For pipeline support
3. **Docker Plugin** - For Docker operations
4. **Docker Pipeline Plugin** - For Docker in pipelines
5. **GitHub Integration Plugin** - For GitHub webhooks
6. **Credentials Plugin** - For managing secrets
7. **JUnit Plugin** - For test reports
8. **Pipeline: Stage View Plugin** - For better visualization
9. **Blue Ocean** (Optional) - Modern UI for pipelines

### Installation Command:

```bash
# Or install via Jenkins CLI
java -jar jenkins-cli.jar -s http://localhost:8080/ install-plugin \
  git \
  workflow-aggregator \
  docker-workflow \
  github \
  credentials-binding \
  junit \
  pipeline-stage-view \
  blueocean
```

---

## Configure Jenkins Credentials

### 1. Docker Hub Credentials

1. Go to: **Manage Jenkins** → **Manage Credentials**
2. Click on **(global)** domain
3. Click **Add Credentials**
4. Fill in:
   - **Kind**: Username with password
   - **Scope**: Global
   - **Username**: `thisarasamuditha` (your Docker Hub username)
   - **Password**: Your Docker Hub password or access token
   - **ID**: `dockerhub-credentials` (must match Jenkinsfile)
   - **Description**: Docker Hub Credentials
5. Click **Create**

### 2. GitHub Credentials (Optional for private repos)

1. Go to: **Manage Jenkins** → **Manage Credentials**
2. Click on **(global)** domain
3. Click **Add Credentials**
4. Fill in:
   - **Kind**: Username with password or Secret text
   - **Scope**: Global
   - **Username**: Your GitHub username
   - **Password**: GitHub Personal Access Token
   - **ID**: `github-credentials`
   - **Description**: GitHub Credentials
5. Click **Create**

### How to Create GitHub Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "Jenkins CI/CD"
4. Select scopes:
   - `repo` (Full control of private repositories)
   - `admin:repo_hook` (for webhooks)
5. Click "Generate token"
6. Copy the token immediately (you won't see it again!)

---

## Create Jenkins Pipeline Job

### Step 1: Create New Pipeline Job

1. From Jenkins dashboard, click **New Item**
2. Enter job name: `task-tracker-pipeline`
3. Select **Pipeline**
4. Click **OK**

### Step 2: Configure Pipeline

#### General Settings:

- ✅ Check "GitHub project"
  - Project url: `https://github.com/thisarasamuditha/task_tracker_devops/`

#### Build Triggers:

- ✅ Check "GitHub hook trigger for GITScm polling"
- ✅ Check "Poll SCM" (as backup)
  - Schedule: `H/5 * * * *` (check every 5 minutes)

#### Pipeline Definition:

- Select: **Pipeline script from SCM**
- SCM: **Git**
- Repository URL: `https://github.com/thisarasamuditha/task_tracker_devops.git`
- Credentials: Select your GitHub credentials (if private repo)
- Branch: `*/master` (or your main branch)
- Script Path: `Jenkinsfile`

### Step 3: Save the Job

Click **Save**

---

## Configure GitHub Webhook (For Automatic Builds)

### Step 1: Get Jenkins Webhook URL

Your webhook URL will be: `http://YOUR_PUBLIC_IP:8080/github-webhook/`

**Note**: For localhost/WSL, you need to expose Jenkins to the internet using:

- **ngrok** (Recommended for testing)
- **Cloudflare Tunnel**
- **Your own public IP** (if available)

### Using ngrok:

```bash
# Install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Authenticate (get token from https://dashboard.ngrok.com)
ngrok config add-authtoken YOUR_NGROK_TOKEN

# Start tunnel to Jenkins
ngrok http 8080
```

This will give you a public URL like: `https://abc123.ngrok.io`

### Step 2: Add Webhook to GitHub

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Webhooks** → **Add webhook**
3. Fill in:
   - **Payload URL**: `https://abc123.ngrok.io/github-webhook/`
   - **Content type**: `application/json`
   - **Which events**: Select "Just the push event"
   - ✅ Active
4. Click **Add webhook**

---

## Install Required Tools on Jenkins Server (WSL)

### 1. Install Node.js and npm

```bash
# Install Node.js 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install Maven

```bash
# Install Maven
sudo apt install maven -y

# Verify installation
mvn -version
```

### 3. Install Docker

```bash
# Install Docker (if not already installed)
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add Jenkins user to docker group
sudo usermod -aG docker jenkins
sudo usermod -aG docker $USER

# Restart Jenkins
sudo systemctl restart jenkins

# Verify Docker installation
docker --version
docker compose version
```

### 4. Install Docker Compose (if not installed)

```bash
# Install Docker Compose
sudo apt install docker-compose -y

# Verify installation
docker-compose --version
```

### 5. Install Trivy (Optional - for security scanning)

```bash
# Install Trivy
sudo apt-get install -y wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy -y

# Verify installation
trivy --version
```

---

## Pipeline Stages Explained

### 1. **Checkout**

- Pulls the latest code from GitHub
- Shows current commit hash

### 2. **Environment Setup**

- Verifies all required tools are installed
- Displays versions of Node, npm, Java, Maven, Docker

### 3. **Build Backend**

- Compiles Spring Boot application using Maven
- Creates JAR file in `target/` directory
- Skips tests for faster build

### 4. **Test Backend**

- Runs JUnit tests
- Generates test reports
- Publishes results to Jenkins

### 5. **Build Frontend**

- Installs npm dependencies
- Builds React application
- Creates production build in `dist/` directory

### 6. **Build Docker Images** (Parallel)

- Builds backend Docker image from Dockerfile
- Builds frontend Docker image from Dockerfile
- Tags images with:
  - Build number (e.g., `12`)
  - Git commit hash (e.g., `a1b2c3d`)
  - Latest tag

### 7. **Security Scan**

- Scans Docker images for vulnerabilities using Trivy
- Reports HIGH and CRITICAL vulnerabilities
- Non-blocking (continues even if vulnerabilities found)

### 8. **Push to Docker Hub**

- Authenticates with Docker Hub
- Pushes all tagged images to Docker Hub
- Makes images available for deployment

### 9. **Deploy**

- Stops existing containers
- Starts new containers using docker-compose
- Uses latest built images

### 10. **Health Check**

- Verifies backend is responding
- Verifies frontend is responding
- Ensures application is fully operational

---

## Running the Pipeline

### Method 1: Automatic (via GitHub Webhook)

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin master
   ```
3. Jenkins will automatically detect the push and start the pipeline

### Method 2: Manual Trigger

1. Go to Jenkins dashboard
2. Click on your pipeline job: `task-tracker-pipeline`
3. Click **Build Now**
4. Watch the pipeline execution in real-time

### Method 3: Using Blue Ocean (Modern UI)

1. Go to Jenkins dashboard
2. Click **Open Blue Ocean** (left sidebar)
3. Select your pipeline
4. Click **Run** button

---

## Monitoring the Pipeline

### 1. Console Output

- Click on the build number (e.g., #1, #2, #3)
- Click **Console Output** to see detailed logs

### 2. Stage View

- Shows each stage's status
- Displays execution time for each stage
- Shows which stage failed (if any)

### 3. Test Results

- Click on build number
- Click **Test Result** to see test reports
- Shows passed/failed tests

### 4. Blue Ocean View

- Modern, visual pipeline interface
- Shows pipeline flow diagram
- Easy to identify bottlenecks

---

## Troubleshooting

### Issue 1: Permission Denied (Docker)

**Error**: `Got permission denied while trying to connect to the Docker daemon socket`

**Solution**:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue 2: Maven Not Found

**Error**: `mvn: command not found`

**Solution**:

```bash
sudo apt install maven -y
sudo systemctl restart jenkins
```

### Issue 3: Node/npm Not Found

**Error**: `node: command not found`

**Solution**:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo systemctl restart jenkins
```

### Issue 4: Docker Build Fails

**Error**: `Cannot connect to Docker daemon`

**Solution**:

```bash
# Start Docker daemon
sudo systemctl start docker

# Verify Docker is running
sudo systemctl status docker

# Restart Jenkins
sudo systemctl restart jenkins
```

### Issue 5: Port Already in Use

**Error**: `Port 8080 already in use`

**Solution**:

```bash
# Change Jenkins port
sudo nano /etc/default/jenkins
# Change HTTP_PORT=8080 to HTTP_PORT=8081

# Restart Jenkins
sudo systemctl restart jenkins
```

### Issue 6: GitHub Webhook Not Triggering

**Possible Causes**:

1. Jenkins not accessible from internet
2. Webhook URL incorrect
3. GitHub webhook failed

**Solution**:

1. Use ngrok to expose Jenkins
2. Check webhook deliveries in GitHub Settings → Webhooks
3. Enable "Poll SCM" as backup in Jenkins job configuration

---

## Best Practices

### 1. Use Multi-Branch Pipeline

For better Git workflow management:

- Create `dev`, `staging`, `master` branches
- Configure different deployment strategies per branch

### 2. Implement Blue-Green Deployment

- Run two identical production environments
- Switch traffic between them for zero-downtime deployments

### 3. Add Notifications

Install plugins for notifications:

- **Slack Notification Plugin**
- **Email Extension Plugin**
- **Discord Notifier Plugin**

### 4. Implement Rollback Strategy

```groovy
stage('Rollback') {
    when {
        expression { currentBuild.result == 'FAILURE' }
    }
    steps {
        sh '''
            docker-compose down
            docker-compose pull
            docker-compose up -d
        '''
    }
}
```

### 5. Use Environment-Specific Configs

- Create `.env.dev`, `.env.staging`, `.env.prod`
- Load appropriate config based on branch

### 6. Implement Approval Gates

For production deployments:

```groovy
stage('Approve Deploy to Production') {
    steps {
        input message: 'Deploy to Production?', ok: 'Deploy'
    }
}
```

---

## Accessing Your Application

After successful pipeline execution:

- **Frontend**: http://localhost:9000
- **Backend API**: http://localhost:8000
- **Database**: localhost:3307

---

## Docker Hub Images

Your images will be available at:

- Backend: `https://hub.docker.com/r/thisarasamuditha/task_tracker_backend`
- Frontend: `https://hub.docker.com/r/thisarasamuditha/task_tracker_frontend`

To pull and run:

```bash
docker pull thisarasamuditha/task_tracker_backend:latest
docker pull thisarasamuditha/task_tracker_frontend:latest
```

---

## Cleanup

### Remove Old Docker Images

```bash
# Remove dangling images
docker image prune -f

# Remove unused images
docker image prune -a -f

# Remove stopped containers
docker container prune -f
```

### Stop Jenkins

```bash
sudo systemctl stop jenkins
```

### Uninstall Jenkins (if needed)

```bash
sudo systemctl stop jenkins
sudo apt-get remove --purge jenkins -y
sudo rm -rf /var/lib/jenkins
sudo rm -rf /etc/default/jenkins
```

---

## Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Webhooks](https://docs.github.com/en/developers/webhooks-and-events/webhooks)

---

## Support

For issues or questions:

1. Check Jenkins logs: `sudo journalctl -u jenkins -f`
2. Check Docker logs: `docker-compose logs -f`
3. Check GitHub webhook deliveries
4. Review Jenkins console output

---

## Next Steps

1. ✅ Install Jenkins on WSL
2. ✅ Configure Jenkins with required plugins
3. ✅ Add Docker Hub credentials
4. ✅ Create pipeline job
5. ✅ Push code to GitHub
6. ✅ Set up GitHub webhook
7. ✅ Monitor pipeline execution
8. ✅ Access deployed application

Good luck with your CI/CD pipeline! 🚀
