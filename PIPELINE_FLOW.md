# CI/CD Pipeline Flow Diagram

## Complete Pipeline Architecture

```
┌──────────────┐
│  Developer   │
│    Local     │
│ Development  │
└──────┬───────┘
       │ git push
       ▼
┌──────────────┐
│   GitHub     │
│  Repository  │
│    master    │
└──────┬───────┘
       │ webhook
       ▼
┌──────────────────────────────────────────────────────────┐
│                     JENKINS (WSL)                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Stage 1: Checkout                                        │
│  ├─ Clone repository                                      │
│  └─ Get commit hash                                       │
│                                                           │
│  Stage 2: Environment Setup                               │
│  ├─ Verify Node.js                                        │
│  ├─ Verify Maven                                          │
│  ├─ Verify Java                                           │
│  └─ Verify Docker                                         │
│                                                           │
│  Stage 3: Build Backend                                   │
│  ├─ mvn clean package                                     │
│  └─ Create JAR file                                       │
│                                                           │
│  Stage 4: Test Backend                                    │
│  ├─ mvn test                                              │
│  ├─ Run JUnit tests                                       │
│  └─ Generate reports                                      │
│                                                           │
│  Stage 5: Build Frontend                                  │
│  ├─ npm install                                           │
│  ├─ npm run build                                         │
│  └─ Create dist/ bundle                                   │
│                                                           │
│  Stage 6: Build Docker Images (Parallel)                  │
│  ├─────────────────┬─────────────────┐                   │
│  │  Backend Image  │ Frontend Image  │                   │
│  │  ├─ Dockerfile  │  ├─ Dockerfile  │                   │
│  │  ├─ Tag: latest │  ├─ Tag: latest │                   │
│  │  ├─ Tag: build# │  ├─ Tag: build# │                   │
│  │  └─ Tag: commit │  └─ Tag: commit │                   │
│  └─────────────────┴─────────────────┘                   │
│                                                           │
│  Stage 7: Security Scan                                   │
│  ├─ Trivy scan backend                                    │
│  └─ Trivy scan frontend                                   │
│                                                           │
│  Stage 8: Push to Docker Hub                              │
│  ├─ Login to Docker Hub                                   │
│  ├─ Push backend:latest                                   │
│  ├─ Push backend:{build}                                  │
│  ├─ Push backend:{commit}                                 │
│  ├─ Push frontend:latest                                  │
│  ├─ Push frontend:{build}                                 │
│  └─ Push frontend:{commit}                                │
│                                                           │
│  Stage 9: Deploy                                          │
│  ├─ docker-compose down                                   │
│  └─ docker-compose up -d                                  │
│                                                           │
│  Stage 10: Health Check                                   │
│  ├─ Check backend health                                  │
│  └─ Check frontend health                                 │
│                                                           │
└──────────────────┬────────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │   Docker Hub    │
         │   ├─ Backend    │
         │   └─ Frontend   │
         └─────────┬───────┘
                   │
                   ▼
         ┌─────────────────┐
         │   Deployment    │
         │   ├─ Backend    │
         │   ├─ Frontend   │
         │   └─ Database   │
         └─────────────────┘
```

## Detailed Stage Breakdown

### Stage 1: Checkout 🔄

```
Input:  GitHub repository URL
Action: Git clone/pull latest code
Output: Source code in workspace
```

### Stage 2: Environment Setup 🔧

```
Check:
  ✓ Java 17
  ✓ Maven 3.9+
  ✓ Node.js 22+
  ✓ npm 10+
  ✓ Docker 24+
```

### Stage 3: Build Backend 🏗️

```
Command: mvn clean package -DskipTests
Input:  backend/pom.xml
Output: backend/target/demo-0.0.1-SNAPSHOT.jar
Time:   ~2-3 minutes
```

### Stage 4: Test Backend 🧪

```
Command: mvn test
Input:  src/test/java/**/*.java
Output: target/surefire-reports/*.xml
Tests:  JUnit test results
```

### Stage 5: Build Frontend 🎨

```
Commands:
  1. npm install --legacy-peer-deps
  2. npm run build
Input:  frontend/src/**
Output: frontend/dist/**
Time:   ~1-2 minutes
```

### Stage 6: Build Docker Images 🐳

```
Backend:
  FROM eclipse-temurin:17-jre
  COPY target/*.jar app.jar
  EXPOSE 8000
  Tags: latest, {build}, {commit}

Frontend:
  FROM nginx:1.27-alpine
  COPY dist/ /usr/share/nginx/html/
  EXPOSE 80
  Tags: latest, {build}, {commit}
```

### Stage 7: Security Scan 🔒

```
Tool: Trivy
Scan: HIGH and CRITICAL vulnerabilities
Mode: Non-blocking (continues on findings)
```

### Stage 8: Push to Docker Hub 📤

```
Registry: hub.docker.com
Images:
  - thisarasamuditha/task_tracker_backend:latest
  - thisarasamuditha/task_tracker_backend:{build}
  - thisarasamuditha/task_tracker_backend:{commit}
  - thisarasamuditha/task_tracker_frontend:latest
  - thisarasamuditha/task_tracker_frontend:{build}
  - thisarasamuditha/task_tracker_frontend:{commit}
```

### Stage 9: Deploy 🚀

```
Commands:
  1. docker-compose down
  2. docker-compose up -d

Services Started:
  - db (MySQL:8.0)
  - backend (Spring Boot)
  - frontend (Nginx)
```

### Stage 10: Health Check ✅

```
Backend:  http://localhost:8000/actuator/health
Frontend: http://localhost:9000
Timeout:  150 seconds
Retry:    Every 5 seconds
```

## Pipeline Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     EXECUTION TIMELINE                       │
├─────────────────────────────────────────────────────────────┤
│ 00:00 - Checkout                          [████] 10s        │
│ 00:10 - Environment Setup                 [███] 5s          │
│ 00:15 - Build Backend                     [████████] 120s   │
│ 02:15 - Test Backend                      [██████] 60s      │
│ 03:15 - Build Frontend                    [█████] 80s       │
│ 04:35 - Build Docker Images (Parallel)    [██████] 90s      │
│ 06:05 - Security Scan                     [████] 30s        │
│ 06:35 - Push to Docker Hub                [█████] 45s       │
│ 07:20 - Deploy                            [████] 35s        │
│ 07:55 - Health Check                      [███] 30s         │
├─────────────────────────────────────────────────────────────┤
│ Total Time: ~8-10 minutes                                   │
└─────────────────────────────────────────────────────────────┘
```

## Success Criteria

```
✅ All stages complete without errors
✅ Backend tests pass (100%)
✅ Docker images built successfully
✅ Images pushed to Docker Hub
✅ Containers started and healthy
✅ Application accessible via browser
```

## Failure Handling

```
❌ Build Failure
   └─> Jenkins marks build as FAILED
       └─> Sends notification
           └─> No deployment occurs
               └─> Previous version remains running

❌ Test Failure
   └─> Pipeline stops
       └─> Test reports published
           └─> Developer fixes tests
               └─> Push code again

❌ Deployment Failure
   └─> Containers not started
       └─> Rollback to previous version
           └─> Manual intervention required
```

## Parallel Execution

```
┌───────────────────────────────────────────────────┐
│         Stage 6: Build Docker Images              │
├───────────────────────────────────────────────────┤
│                                                   │
│  Thread 1: Backend          Thread 2: Frontend   │
│  ┌──────────────┐           ┌──────────────┐    │
│  │ Load context │           │ Load context │    │
│  └──────┬───────┘           └──────┬───────┘    │
│         │                           │            │
│  ┌──────▼───────┐           ┌──────▼───────┐    │
│  │ Build layers │           │ Build layers │    │
│  └──────┬───────┘           └──────┬───────┘    │
│         │                           │            │
│  ┌──────▼───────┐           ┌──────▼───────┐    │
│  │  Tag images  │           │  Tag images  │    │
│  └──────┬───────┘           └──────┬───────┘    │
│         │                           │            │
│         └───────────┬───────────────┘            │
│                     │                            │
│              ┌──────▼───────┐                    │
│              │   Complete   │                    │
│              └──────────────┘                    │
│                                                   │
└───────────────────────────────────────────────────┘

Time Saved: ~50% by parallel execution
```

## Post-Build Actions

### On Success ✅

```
1. Archive artifacts
   - backend/target/*.jar
   - frontend/dist/**

2. Publish test results
   - JUnit XML reports

3. Clean old Docker images
   - Keep last 5 builds

4. Send success notification

5. Update build status on GitHub
```

### On Failure ❌

```
1. Preserve workspace for debugging

2. Archive console logs

3. Send failure notification

4. Update build status on GitHub

5. No deployment occurs
```

## Monitoring & Alerts

```
┌─────────────────────────────────────────┐
│         Monitoring Points               │
├─────────────────────────────────────────┤
│ ✓ Build duration                        │
│ ✓ Test pass/fail rate                   │
│ ✓ Docker build time                     │
│ ✓ Deployment success rate               │
│ ✓ Security vulnerabilities found        │
│ ✓ Application health status             │
└─────────────────────────────────────────┘
```

## Environment Variables

```
Pipeline Environment:
├─ DOCKER_HUB_CREDENTIALS  (from Jenkins)
├─ DOCKER_HUB_USERNAME     = thisarasamuditha
├─ BACKEND_IMAGE           = thisarasamuditha/task_tracker_backend
├─ FRONTEND_IMAGE          = thisarasamuditha/task_tracker_frontend
├─ BUILD_TAG               = ${BUILD_NUMBER}
└─ GIT_COMMIT_SHORT        = $(git rev-parse --short HEAD)

Application Environment:
├─ MYSQL_ROOT_PASSWORD     = Tt51714183.
├─ MYSQL_DATABASE          = task_tracker
├─ SERVER_PORT             = 8000
├─ SPRING_PROFILES_ACTIVE  = prod
└─ VITE_API_BASE_URL       = /api
```

## Rollback Strategy

```
Manual Rollback:
1. Identify last working build
2. docker pull {image}:{working-build-number}
3. docker-compose down
4. Update docker-compose.yml with specific tags
5. docker-compose up -d

Automatic Rollback (on health check failure):
- Currently: Manual intervention required
- Future: Implement blue-green deployment
```

---

**This completes the CI/CD pipeline documentation!** 🎉
