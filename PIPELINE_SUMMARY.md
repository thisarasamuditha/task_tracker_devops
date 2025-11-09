# Jenkins CI/CD Pipeline - Quick Reference

## 📁 Files Created

### 1. **Jenkinsfile** ⭐

**Location**: `./Jenkinsfile`

The main CI/CD pipeline configuration that implements:

- ✅ Code checkout from GitHub
- ✅ Backend build (Maven + Spring Boot)
- ✅ Backend testing (JUnit)
- ✅ Frontend build (npm + Vite + React)
- ✅ Docker image creation (parallel builds)
- ✅ Security scanning (Trivy)
- ✅ Docker Hub publishing
- ✅ Automated deployment
- ✅ Health checks

### 2. **JENKINS_SETUP.md** 📚

**Location**: `./JENKINS_SETUP.md`

Complete step-by-step guide covering:

- Jenkins installation on WSL
- Required plugins installation
- Credentials configuration
- GitHub webhook setup
- Pipeline job creation
- Troubleshooting guide
- Best practices

### 3. **setup-jenkins.sh** 🔧

**Location**: `./setup-jenkins.sh`

Automated installation script that installs:

- Java 17
- Jenkins
- Node.js 22 & npm
- Maven
- Docker & Docker Compose
- Trivy (security scanner)

**Usage**:

```bash
chmod +x setup-jenkins.sh
./setup-jenkins.sh
```

### 4. **verify-setup.sh** ✅

**Location**: `./verify-setup.sh`

Verification script that checks:

- All required tools are installed
- Services are running
- Docker permissions are correct
- Ports are available
- Project files exist

**Usage**:

```bash
chmod +x verify-setup.sh
./verify-setup.sh
```

### 5. **.env.example** 🔐

**Location**: `./.env.example`

Environment variables template containing:

- Database credentials
- Backend configuration
- Docker Hub username
- Frontend API URL

### 6. **.gitignore** 🚫

**Location**: `./.gitignore`

Git ignore rules for:

- Environment files (.env)
- IDE configurations
- Build artifacts
- Log files
- Docker overrides

### 7. **README.md** 📖

**Location**: `./README.md`

Updated comprehensive project documentation with:

- Architecture overview
- Tech stack details
- Quick start guide
- CI/CD pipeline information
- API documentation
- Troubleshooting tips

---

## 🚀 Quick Start Guide

### Step 1: Install Jenkins

```bash
# Run the automated setup script
chmod +x setup-jenkins.sh
./setup-jenkins.sh
```

### Step 2: Verify Installation

```bash
# Check if everything is installed correctly
chmod +x verify-setup.sh
./verify-setup.sh
```

### Step 3: Access Jenkins

1. Open browser: http://localhost:8080
2. Use initial admin password from terminal output
3. Install suggested plugins
4. Create admin user

### Step 4: Configure Docker Hub Credentials

1. Go to: **Manage Jenkins** → **Manage Credentials**
2. Add Docker Hub credentials with ID: `dockerhub-credentials`
3. Username: `thisarasamuditha`
4. Password: Your Docker Hub password/token

### Step 5: Create Pipeline Job

1. Click **New Item**
2. Name: `task-tracker-pipeline`
3. Type: **Pipeline**
4. Configure:
   - GitHub project URL
   - SCM: Git repository
   - Script path: `Jenkinsfile`

### Step 6: Push to GitHub

```bash
git add .
git commit -m "Add Jenkins CI/CD pipeline"
git push origin master
```

### Step 7: Build Pipeline

Click **Build Now** in Jenkins or push code to trigger automatic build

---

## 📊 Pipeline Stages Overview

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Checkout        │ Pull code from GitHub                  │
├─────────────────────────────────────────────────────────────┤
│ 2. Environment     │ Verify tools (Java, Maven, Node, etc) │
├─────────────────────────────────────────────────────────────┤
│ 3. Build Backend   │ mvn clean package                      │
├─────────────────────────────────────────────────────────────┤
│ 4. Test Backend    │ mvn test + JUnit reports              │
├─────────────────────────────────────────────────────────────┤
│ 5. Build Frontend  │ npm install + npm run build           │
├─────────────────────────────────────────────────────────────┤
│ 6. Docker Build    │ Parallel: Backend + Frontend images   │
├─────────────────────────────────────────────────────────────┤
│ 7. Security Scan   │ Trivy vulnerability scan              │
├─────────────────────────────────────────────────────────────┤
│ 8. Push DockerHub  │ Push with tags: latest, build#, commit│
├─────────────────────────────────────────────────────────────┤
│ 9. Deploy          │ docker-compose up -d                   │
├─────────────────────────────────────────────────────────────┤
│ 10. Health Check   │ Verify app is running                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Configuration Points

### Docker Images

- **Backend**: `thisarasamuditha/task_tracker_backend`
- **Frontend**: `thisarasamuditha/task_tracker_frontend`

### Image Tags

Each build creates 3 tags:

- `latest` - Always points to latest build
- `{BUILD_NUMBER}` - Jenkins build number (e.g., `12`)
- `{GIT_COMMIT}` - Git commit hash (e.g., `a1b2c3d`)

### Application Ports

- **Frontend**: 9000 (Nginx)
- **Backend**: 8000 (Spring Boot)
- **Database**: 3307 (MySQL)

### Jenkins Credentials

Required credential ID: `dockerhub-credentials`

- Type: Username with password
- Scope: Global

---

## 🔄 Git Workflow

### Development Flow

```bash
# Make changes
git add .
git commit -m "Your message"
git push origin master
```

### GitHub Webhook Trigger

Push to GitHub → Webhook → Jenkins → Pipeline Starts

### Manual Trigger

Jenkins Dashboard → Your Job → Build Now

---

## 🐳 Docker Hub Integration

### Automatic Push

Pipeline automatically pushes images to Docker Hub after successful build

### Manual Pull

```bash
docker pull thisarasamuditha/task_tracker_backend:latest
docker pull thisarasamuditha/task_tracker_frontend:latest
```

### View on Docker Hub

- Backend: https://hub.docker.com/r/thisarasamuditha/task_tracker_backend
- Frontend: https://hub.docker.com/r/thisarasamuditha/task_tracker_frontend

---

## 📱 Accessing Your Application

After successful deployment:

| Service  | URL                   | Description      |
| -------- | --------------------- | ---------------- |
| Frontend | http://localhost:9000 | React UI         |
| Backend  | http://localhost:8000 | Spring Boot API  |
| Database | localhost:3307        | MySQL (internal) |
| Jenkins  | http://localhost:8080 | CI/CD Dashboard  |

---

## 🔍 Monitoring & Logs

### Jenkins Logs

```bash
# Jenkins service logs
sudo journalctl -u jenkins -f

# Jenkins console output
# Access via Jenkins UI → Build → Console Output
```

### Application Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Docker Logs

```bash
# Container logs
docker logs <container-name> -f
```

---

## ⚠️ Common Issues & Solutions

### Issue: Docker Permission Denied

```bash
sudo usermod -aG docker jenkins
sudo usermod -aG docker $USER
sudo systemctl restart jenkins
newgrp docker
```

### Issue: Port Already in Use

```bash
# Stop existing containers
docker-compose down

# Kill process on port
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:9000 | xargs kill -9  # Frontend
```

### Issue: Jenkins Not Starting

```bash
# Check status
sudo systemctl status jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Check logs
sudo journalctl -u jenkins -xe
```

### Issue: Build Fails - Tool Not Found

```bash
# Verify all tools are installed
./verify-setup.sh

# Restart Jenkins after installing tools
sudo systemctl restart jenkins
```

---

## 🎯 Next Steps

1. ✅ **Complete**: Jenkins installation and pipeline setup
2. 🔄 **Next**: Configure GitHub webhook for auto-builds
3. 🔄 **Next**: Set up notifications (Slack/Email)
4. 🔄 **Next**: Add staging environment
5. 🔄 **Next**: Implement blue-green deployment
6. 🔄 **Next**: Add automated testing in pipeline
7. 🔄 **Next**: Set up monitoring (Prometheus/Grafana)

---

## 📚 Additional Resources

- **Detailed Setup**: [JENKINS_SETUP.md](./JENKINS_SETUP.md)
- **Project README**: [README.md](./README.md)
- **Docker Setup**: [DOCKER_SETUP.md](./DOCKER_SETUP.md)

---

## 📞 Support

### Get Help

1. Check **JENKINS_SETUP.md** troubleshooting section
2. Run `./verify-setup.sh` to diagnose issues
3. Check Jenkins console output for error details
4. Review application logs: `docker-compose logs -f`

### Useful Commands

```bash
# Jenkins
sudo systemctl status jenkins
sudo systemctl restart jenkins
sudo journalctl -u jenkins -f

# Docker
docker ps
docker-compose ps
docker-compose logs -f
docker images

# Application
curl http://localhost:8000
curl http://localhost:9000

# Cleanup
docker system prune -af
docker volume prune -f
```

---

**🎉 You're all set! Your CI/CD pipeline is ready to use!**

Push your code to GitHub and watch the magic happen! ✨
