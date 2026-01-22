# MySQL Database Integration - Action Checklist

## ✅ What Has Been Done

- [x] Updated `docker-compose.yml` with MySQL service
- [x] Configured persistent volume for database data
- [x] Set memory limits for t3.micro compatibility
- [x] Updated backend `application-prod.properties` for Docker MySQL
- [x] Added MySQL port (3306) to Terraform security group
- [x] Updated README.md with database documentation
- [x] Created DATABASE_SETUP.md with detailed changes
- [x] Created QUICK_REFERENCE.md for fast lookup
- [x] Created ARCHITECTURE.md with visual diagrams
- [x] Updated .gitignore for database files

---

## ⏭️ What You Need to Do

### Step 1: Update DockerHub Username
**File:** `docker-compose.yml`

**Action:**
```bash
# Replace on line 28 and line 51:
YOUR_DOCKERHUB_USERNAME
# With your actual DockerHub username
```

**Example:**
```yaml
# Before:
image: YOUR_DOCKERHUB_USERNAME/backend:latest

# After:
image: johndoe/backend:latest
```

---

### Step 2: Verify Backend pom.xml (Optional)

**File:** `backend/pom.xml`

**Check if MySQL connector is present:**
```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

**If missing, add it and rebuild:**
```bash
cd backend
mvn clean package
```

---

### Step 3: Test Locally (Recommended)

**Purpose:** Verify everything works before deploying to EC2

```bash
# From project root
cd "/mnt/f/sem 5 mine/DevOps/project/version_2.0_completed_finalized"

# Start all containers
docker-compose up -d

# Wait 30 seconds for MySQL to initialize
sleep 30

# Check status
docker ps

# Expected output:
# - mysql_db (healthy)
# - backend (running)
# - frontend (running)

# Check MySQL logs
docker logs mysql_db | tail -20

# Check backend logs
docker logs backend | tail -20

# Test database connection
docker exec mysql_db mysql -u devops -pDevOps@2026 -e "SHOW DATABASES;"

# Test backend API (if you have a health endpoint)
curl http://localhost:8080/actuator/health

# Test frontend
curl http://localhost

# Clean up (optional)
docker-compose down
```

---

### Step 4: Commit and Push Changes

```bash
# Check what changed
git status

# Expected files:
# - docker-compose.yml (modified)
# - backend/src/main/resources/application-prod.properties (modified)
# - terraform/main.tf (modified)
# - README.md (modified)
# - .gitignore (modified)
# - DATABASE_SETUP.md (new)
# - QUICK_REFERENCE.md (new)
# - ARCHITECTURE.md (new)

# Add all changes
git add .

# Commit with meaningful message
git commit -m "Add MySQL database container to EC2 deployment

- Added MySQL 8.0 service to docker-compose.yml
- Configured backend to connect to containerized database
- Updated Terraform security group for MySQL port
- Added memory limits for t3.micro compatibility
- Created comprehensive database documentation"

# Push to GitHub
git push origin main
```

---

### Step 5: Update EC2 Infrastructure (If Already Created)

**If you haven't created EC2 yet:**
- Skip this step, proceed to Step 6

**If EC2 already exists:**
```bash
cd terraform

# Check what will change
terraform plan

# Expected: Security group will be updated to add port 3306

# Apply changes
terraform apply
# Type 'yes' when prompted

# Verify
terraform show | grep 3306
```

---

### Step 6: Deploy via Jenkins

**Option A: Automatic (if webhook configured)**
1. Push to GitHub (already done in Step 4)
2. Jenkins auto-triggers
3. Monitor pipeline progress

**Option B: Manual trigger**
1. Open Jenkins: `http://localhost:8080`
2. Go to `devops-project-pipeline`
3. Click **Build Now**
4. Watch **Console Output**

**Expected stages:**
1. ✅ Checkout
2. ✅ Build Backend Image
3. ✅ Build Frontend Image
4. ✅ Push Images to DockerHub
5. ✅ Update docker-compose.yml
6. ✅ Deploy to EC2 with Ansible

**Pipeline will:**
- Build frontend and backend images
- Push to DockerHub
- Ansible copies docker-compose.yml to EC2
- Ansible runs `docker compose up -d`
- Docker pulls: frontend, backend, **mysql:8.0**

---

### Step 7: Verify Deployment on EC2

```bash
# SSH into EC2
ssh -i terraform/devops-key ubuntu@<EC2_PUBLIC_IP>

# Check containers are running
docker ps

# Expected output (3 containers):
# CONTAINER ID   IMAGE                      STATUS         PORTS
# xxxx           your-user/frontend:latest  Up X minutes   0.0.0.0:80->80/tcp
# xxxx           your-user/backend:latest   Up X minutes   0.0.0.0:8080->8080/tcp
# xxxx           mysql:8.0                  Up X minutes   0.0.0.0:3306->3306/tcp

# Check MySQL is ready
docker logs mysql_db | grep "ready for connections"

# Should see:
# [Server] /usr/sbin/mysqld: ready for connections. Version: '8.0.xx'

# Check backend connected to database
docker logs backend | grep -i "started"

# Should see:
# Started DemoApplication in X.XXX seconds

# Test database
docker exec mysql_db mysql -u devops -pDevOps@2026 taskdb -e "SHOW TABLES;"

# Check memory usage
docker stats --no-stream

# Exit
exit
```

---

### Step 8: Test Application

**Frontend:**
```bash
# Open in browser
http://<EC2_PUBLIC_IP>

# Expected: React app loads
```

**Backend API:**
```bash
# Test from terminal
curl http://<EC2_PUBLIC_IP>:8080/api

# Or open in browser
http://<EC2_PUBLIC_IP>:8080/api
```

**Database (Optional):**
```bash
# Only if you need external DB access for debugging
mysql -h <EC2_PUBLIC_IP> -P 3306 -u devops -pDevOps@2026 taskdb
```

---

### Step 9: Test Full User Flow

1. Open frontend: `http://<EC2_PUBLIC_IP>`
2. Sign up with new user
3. Log in
4. Create a task
5. Update task status
6. Delete a task

**Verify data persists:**
```bash
# SSH into EC2
ssh -i terraform/devops-key ubuntu@<EC2_IP>

# Check database has data
docker exec mysql_db mysql -u devops -pDevOps@2026 taskdb -e "SELECT * FROM users;"
docker exec mysql_db mysql -u devops -pDevOps@2026 taskdb -e "SELECT * FROM tasks;"

# Restart containers
cd /home/ubuntu/app
docker-compose restart

# Wait 30 seconds
sleep 30

# Check data still exists (persistent volume working)
docker exec mysql_db mysql -u devops -pDevOps@2026 taskdb -e "SELECT COUNT(*) FROM users;"

exit
```

---

## ⚠️ Common Issues During Setup

### Issue 1: "YOUR_DOCKERHUB_USERNAME not found"
**Solution:** You forgot to replace YOUR_DOCKERHUB_USERNAME in docker-compose.yml

### Issue 2: Backend can't connect to database
**Solution:** Wait 30-60 seconds after deployment, then restart backend:
```bash
docker restart backend
```

### Issue 3: Out of memory
**Solution:** Add to docker-compose.yml under db service:
```yaml
command: --innodb-buffer-pool-size=128M
```

### Issue 4: Database data lost after restart
**Solution:** Ensure volume is properly created:
```bash
docker volume ls | grep mysql_data
docker volume inspect mysql_data
```

---

## 📊 Success Criteria

- [ ] All 3 containers running on EC2
- [ ] MySQL showing "ready for connections" in logs
- [ ] Backend successfully started
- [ ] Frontend accessible at `http://<EC2_IP>`
- [ ] Can create/read/update/delete tasks
- [ ] Data persists after container restart
- [ ] Memory usage within t3.micro limits (~900MB total)

---

## 📚 Reference Documents

| Document | Purpose |
|----------|---------|
| `README.md` | Complete project guide with all phases |
| `DATABASE_SETUP.md` | Detailed explanation of database changes |
| `QUICK_REFERENCE.md` | Fast lookup for commands and credentials |
| `ARCHITECTURE.md` | Visual diagrams of system architecture |
| `docker-compose.yml` | Container orchestration configuration |
| `terraform/main.tf` | Infrastructure as code |
| `ansible/deploy.yml` | Deployment automation |

---

## 🆘 Need Help?

**If deployment fails:**
1. Check Jenkins console output for errors
2. SSH into EC2 and check container logs
3. Verify MySQL is running: `docker logs mysql_db`
4. Check backend connection: `docker logs backend | grep -i error`
5. Review Phase 8 troubleshooting in README.md

**For specific issues:**
- Memory problems → QUICK_REFERENCE.md → Troubleshooting
- Connection errors → DATABASE_SETUP.md → Common Issues
- Architecture questions → ARCHITECTURE.md

---

## ✨ Final Notes

- **Database credentials are for demo/academic purposes only**
- In production, use:
  - Strong passwords
  - AWS Secrets Manager
  - Restrict security group for port 3306
  - Enable MySQL SSL
  - Regular backups

- **t3.micro limitations:**
  - 1GB RAM is tight for 3 containers
  - Monitor memory with `docker stats`
  - Consider t3.small if performance issues occur

- **Data persistence:**
  - MySQL data is stored in Docker volume `mysql_data`
  - Survives container restarts
  - Does NOT survive EC2 termination
  - Backup important data: `mysqldump`

**Good luck with your deployment! 🚀**
