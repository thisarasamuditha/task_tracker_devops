# MySQL Database Integration - Summary of Changes

## Overview
Added MySQL 8.0 database as a Docker container running inside the EC2 instance alongside frontend and backend.

---

## Files Modified

### 1. docker-compose.yml ✅
**Changes:**
- Added `db` service (MySQL 8.0 container)
- Added persistent volume `mysql_data` for database storage
- Configured backend to depend on database health check
- Added environment variables for database connection
- Set memory limits for t3.micro (1GB RAM total):
  - MySQL: 300MB
  - Backend: 400MB
  - Frontend: 200MB

**Key Configuration:**
```yaml
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: DevOps@2026
      MYSQL_DATABASE: taskdb
      MYSQL_USER: devops
      MYSQL_PASSWORD: DevOps@2026
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: mysqladmin ping
      
  backend:
    depends_on:
      db:
        condition: service_healthy
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/taskdb
      - SPRING_DATASOURCE_USERNAME=devops
      - SPRING_DATASOURCE_PASSWORD=DevOps@2026
```

---

### 2. backend/src/main/resources/application-prod.properties ✅
**Changes:**
- Removed Clever Cloud database configuration
- Added Docker MySQL configuration
- Database connects using service name `db` (not localhost)
- All values use environment variables with defaults
- Reduced connection pool size for low-memory instance (5 max connections)

**Key Changes:**
```properties
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:mysql://db:3306/taskdb}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:devops}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:DevOps@2026}
spring.datasource.hikari.maximum-pool-size=5  # Reduced for t3.micro
```

---

### 3. terraform/main.tf ✅
**Changes:**
- Added ingress rule for MySQL port 3306 in security group
- Optional: for external database access during testing/debugging
- Can be removed in production if external access not needed

**New Rule:**
```hcl
ingress {
  from_port   = 3306
  to_port     = 3306
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
  description = "MySQL database access (optional)"
}
```

---

### 4. README.md ✅
**Changes:**
- Added Phase 3.5: Database Configuration
- Updated Project Overview to include MySQL
- Updated Tech Stack table
- Added database troubleshooting section (Issues 7 & 8)
- Updated Complete Workflow diagram
- Added database monitoring commands

---

## Files NOT Modified (No Changes Needed)

### 1. Jenkinsfile ❌ No changes needed
**Why:** Jenkins only builds frontend and backend images. MySQL uses official image from DockerHub.

### 2. ansible/deploy.yml ❌ No changes needed
**Why:** Ansible already handles `docker compose up -d`, which will automatically start all 3 containers.

### 3. Dockerfiles (frontend/backend) ❌ No changes needed
**Why:** Application code remains the same, only configuration changed.

---

## Database Details

### Credentials (Academic/Demo)
- **Root Password:** DevOps@2026
- **Database Name:** taskdb
- **Username:** devops
- **Password:** DevOps@2026

### Container Details
- **Image:** mysql:8.0 (official from DockerHub)
- **Port:** 3306
- **Memory Limit:** 300MB
- **Volume:** mysql_data (persistent storage)
- **Health Check:** mysqladmin ping every 10 seconds

### Resource Allocation (t3.micro - 1GB RAM)
```
MySQL:    300MB (30%)
Backend:  400MB (40%)
Frontend: 200MB (20%)
System:   ~100MB (10%)
```

---

## Testing Checklist

### Local Testing (Before Deployment)
```bash
# Build and test locally
docker-compose up -d

# Check containers
docker ps

# Check MySQL logs
docker logs mysql_db

# Test database connection
docker exec mysql_db mysql -u devops -pDevOps@2026 -e "SHOW DATABASES;"

# Test backend connection to database
docker logs backend | grep -i "mysql\|database"
```

### After Deployment to EC2
```bash
# SSH into EC2
ssh -i terraform/devops-key ubuntu@<EC2_IP>

# Check all containers running
docker ps

# Verify database
docker logs mysql_db | grep "ready for connections"

# Check backend logs
docker logs backend | grep -i "Started DemoApplication"

# Test database from backend
docker exec mysql_db mysql -u devops -pDevOps@2026 taskdb -e "SHOW TABLES;"
```

---

## Common Issues & Solutions

### Issue 1: Backend can't connect to database
**Cause:** Database not fully initialized
**Solution:** Wait 30-60 seconds after `docker compose up`, then restart backend:
```bash
docker restart backend
```

### Issue 2: Out of memory
**Cause:** t3.micro has only 1GB RAM
**Solution:** Reduce MySQL buffer pool:
```yaml
# In docker-compose.yml under db service:
command: --innodb-buffer-pool-size=128M
```

### Issue 3: Data loss after restart
**Cause:** Volume not properly configured
**Solution:** Ensure volume exists:
```bash
docker volume ls | grep mysql_data
docker volume inspect mysql_data
```

---

## Deployment Steps

### Step 1: Update Files
1. ✅ docker-compose.yml (already updated)
2. ✅ backend/src/main/resources/application-prod.properties (already updated)
3. ✅ terraform/main.tf (already updated)

### Step 2: Replace YOUR_DOCKERHUB_USERNAME
Edit docker-compose.yml and replace with your actual username in:
- Line 28: `image: YOUR_DOCKERHUB_USERNAME/backend:latest`
- Line 51: `image: YOUR_DOCKERHUB_USERNAME/frontend:latest`

### Step 3: Commit and Push
```bash
git add .
git commit -m "Add MySQL database container"
git push origin main
```

### Step 4: Update EC2 Security Group (if needed)
```bash
# If EC2 already exists, update with new terraform config
cd terraform
terraform apply
```

### Step 5: Deploy via Jenkins
- Trigger Jenkins pipeline
- Jenkins will build images and push to DockerHub
- Ansible will deploy all 3 containers to EC2

### Step 6: Verify Deployment
```bash
ssh -i terraform/devops-key ubuntu@<EC2_IP>
docker ps
# Should see: mysql_db, backend, frontend
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│          AWS EC2 Instance (t3.micro)            │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │         Docker Containers                │  │
│  │                                          │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐ │  │
│  │  │Frontend │  │ Backend │  │  MySQL  │ │  │
│  │  │ (Nginx) │→ │(Spring) │→ │   DB    │ │  │
│  │  │ Port 80 │  │Port 8080│  │Port 3306│ │  │
│  │  └─────────┘  └─────────┘  └─────────┘ │  │
│  │                                 ↓        │  │
│  │                          ┌───────────┐  │  │
│  │                          │ Volume:   │  │  │
│  │                          │mysql_data │  │  │
│  │                          └───────────┘  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                    ↑
                    │
              User Access via
           http://<EC2_PUBLIC_IP>
```

---

## Next Steps

1. ✅ All files updated
2. ⏭️ Replace YOUR_DOCKERHUB_USERNAME in docker-compose.yml
3. ⏭️ Test locally: `docker-compose up -d`
4. ⏭️ Commit and push changes
5. ⏭️ Update Terraform (if EC2 exists): `terraform apply`
6. ⏭️ Trigger Jenkins pipeline
7. ⏭️ Verify deployment on EC2

---

## Support

If you encounter issues:
1. Check container logs: `docker logs <container_name>`
2. Check memory: `docker stats`
3. Verify network: `docker network inspect app-network`
4. Review database connection in backend logs
5. Refer to README.md Phase 8 troubleshooting section
