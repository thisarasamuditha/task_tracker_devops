# Database Separation Guide

## Current Problem
Running Jenkins + MySQL + Backend + Frontend on one t3.micro is causing memory issues and MySQL healthcheck failures.

## Solution Options

### Option 1: AWS RDS MySQL (Recommended for Production)

**Advantages:**
- Fully managed, no maintenance
- Automatic backups
- Better performance
- Free tier available (db.t3.micro, 20GB storage)

**Steps:**
1. Create RDS MySQL instance in AWS Console
2. Set database name: taskdb
3. Set username: devops
4. Set password: DevOps2026
5. Note the endpoint (e.g., mydb.xxxxx.us-east-1.rds.amazonaws.com)
6. Update security group to allow port 3306 from your EC2 IP
7. Use docker-compose-external-db.yml
8. Set DB_HOST environment variable to RDS endpoint

**Cost:** Free tier for 12 months

---

### Option 2: Separate EC2 Instance for Database

**Advantages:**
- Full control over MySQL
- Isolates database load from application
- Better for learning/practice

**Requirements:**
- Second t3.micro EC2 instance (dedicated for MySQL)
- Security group allowing MySQL port 3306

**Setup Steps:**

#### Step 1: Launch Second EC2 Instance

```bash
# In your terraform or AWS console, create second instance
# Name it: devops-database-server
# Instance type: t3.micro
# Same VPC and subnet as application server
```

#### Step 2: Install Docker on Database Server

```bash
ssh -i devops-key ubuntu@<DB_SERVER_IP>

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
```

#### Step 3: Deploy MySQL Container on Database Server

```bash
# Copy docker-compose-db-only.yml to database server
scp -i devops-key docker-compose-db-only.yml ubuntu@<DB_SERVER_IP>:~/

# SSH to database server
ssh -i devops-key ubuntu@<DB_SERVER_IP>

# Start MySQL
docker compose -f docker-compose-db-only.yml up -d

# Verify MySQL is running
docker ps
docker logs mysql_db
```

#### Step 4: Update Application Server Configuration

**Create .env file on application server:**

```bash
# /home/ubuntu/app/.env
DB_HOST=<DATABASE_SERVER_PRIVATE_IP>
MYSQL_DATABASE=taskdb
MYSQL_USER=devops
MYSQL_PASSWORD=DevOps2026
```

#### Step 5: Update Security Groups

**Database Server Security Group:**
- Inbound: MySQL (3306) from Application Server Private IP
- Inbound: SSH (22) from your IP

**Application Server Security Group:**
- Outbound: MySQL (3306) to Database Server Private IP

#### Step 6: Update Ansible Deployment

Update ansible/deploy.yml to use docker-compose-external-db.yml instead of docker-compose.yml

---

### Option 3: Optimize Current Setup (Quickest Fix)

**Use the fixes I already applied:**
- Removed strict memory limits
- Fixed healthcheck
- Increased startup time

**This should work now. Try running the pipeline again.**

The changes I made should allow MySQL to start successfully on your current setup.

---

## Recommended Approach

**For Learning/Practice:**
- Use Option 3 (optimized current setup) - try the current deployment first
- If still failing, use Option 2 (separate EC2)

**For Production:**
- Use Option 1 (AWS RDS) - managed, scalable, reliable

---

## Which Files to Use

### Current Setup (All on one server)
File: `docker-compose.yml` (already fixed)

### Separate Database Server
Application Server: `docker-compose-external-db.yml`
Database Server: `docker-compose-db-only.yml`

---

## Testing the Current Fix First

Before moving database to separate server, try running the pipeline with current fixes:

```bash
git add docker-compose.yml
git commit -m "Fix MySQL healthcheck and memory limits"
git push origin master
```

The deployment should succeed now because:
- MySQL has more time to start (90s start period)
- No strict memory limits causing OOM
- Better healthcheck configuration

If it still fails, then proceed with separate database server option.
