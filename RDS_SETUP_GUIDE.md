# AWS RDS MySQL Setup Guide

## Step 1: Create RDS MySQL Instance

### Using AWS Console

1. Open AWS Console and go to RDS service
2. Click "Create database"

### Database Creation Settings

**Engine options:**
- Engine type: MySQL
- Version: MySQL 8.0.35 (or latest 8.0.x)

**Templates:**
- Select: Free tier

**Settings:**
- DB instance identifier: `devops-taskdb`
- Master username: `admin`
- Master password: `DevOps2026` (or create your own secure password)

**Instance configuration:**
- DB instance class: db.t3.micro (Free tier eligible)

**Storage:**
- Storage type: General Purpose SSD (gp2)
- Allocated storage: 20 GB (Free tier eligible)
- Disable storage autoscaling (to stay within free tier)

**Connectivity:**
- Virtual private cloud (VPC): Same VPC as your EC2 instance
- Public access: Yes (or No if EC2 is in same VPC)
- VPC security group: Create new or select existing
- Availability Zone: Same as your EC2 instance

**Database authentication:**
- Password authentication

**Additional configuration:**
- Initial database name: `taskdb`
- Backup retention period: 7 days (Free tier: up to 7 days)
- Disable automatic backups if you want (to save on free tier)
- Disable encryption (optional, to stay simple)

**Click "Create database"**

Wait 5-10 minutes for the database to be created.

---

## Step 2: Configure Security Group

1. Go to RDS > Databases > devops-taskdb
2. Click on the VPC security group
3. Edit inbound rules
4. Add rule:
   - Type: MySQL/Aurora
   - Protocol: TCP
   - Port: 3306
   - Source: Your EC2 instance security group (or EC2 private IP)
   - Description: Allow MySQL from EC2

---

## Step 3: Get RDS Endpoint

1. Go to RDS > Databases > devops-taskdb
2. In the "Connectivity & security" tab
3. Copy the "Endpoint" value
   - Example: `devops-taskdb.ch6lrvzbxyz.us-east-1.rds.amazonaws.com`

---

## Step 4: Create Database and User

### Option A: Using MySQL Client from EC2

SSH to your EC2 instance:

```bash
ssh -i devops-key ubuntu@43.205.116.130

# Install MySQL client
sudo apt update
sudo apt install mysql-client -y

# Connect to RDS
mysql -h devops-taskdb.ch6lrvzbxyz.us-east-1.rds.amazonaws.com -u admin -p

# Enter password: DevOps2026
```

In MySQL prompt:

```sql
-- Create database (if not created during RDS setup)
CREATE DATABASE IF NOT EXISTS taskdb;

-- Create application user
CREATE USER 'devops'@'%' IDENTIFIED BY 'DevOps2026';

-- Grant privileges
GRANT ALL PRIVILEGES ON taskdb.* TO 'devops'@'%';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User='devops';

-- Exit
EXIT;
```

### Option B: Database Created Automatically

If you specified "Initial database name: taskdb" during RDS creation, the database already exists.

Just create the user:

```sql
CREATE USER 'devops'@'%' IDENTIFIED BY 'DevOps2026';
GRANT ALL PRIVILEGES ON taskdb.* TO 'devops'@'%';
FLUSH PRIVILEGES;
```

---

## Step 5: Create .env File on EC2

SSH to your EC2 instance:

```bash
ssh -i devops-key ubuntu@43.205.116.130

# Create app directory
mkdir -p /home/ubuntu/app
cd /home/ubuntu/app

# Create .env file
cat > .env << 'EOF'
DB_HOST=devops-taskdb.ch6lrvzbxyz.us-east-1.rds.amazonaws.com
DB_NAME=taskdb
DB_USER=devops
DB_PASSWORD=DevOps2026
EOF

# Secure the file
chmod 600 .env

# Verify
cat .env
```

---

## Step 6: Update Ansible Deployment

Your Ansible playbook will automatically copy docker-compose.yml and .env file to the server.

The docker-compose.yml is already configured to use environment variables:
- DB_HOST
- DB_NAME
- DB_USER
- DB_PASSWORD

---

## Step 7: Test Database Connection

From your EC2 instance:

```bash
# Test connection
mysql -h devops-taskdb.ch6lrvzbxyz.us-east-1.rds.amazonaws.com \
      -u devops -pDevOps2026 taskdb

# If successful, you should see:
# MySQL [(taskdb)]>

# Test query
SHOW TABLES;

# Exit
EXIT;
```

---

## Step 8: Deploy Application

Now commit and push your changes:

```bash
git add docker-compose.yml
git commit -m "Configure application to use AWS RDS MySQL"
git push origin master
```

Jenkins will automatically:
1. Build Docker images
2. Push to DockerHub
3. Deploy to EC2
4. Application will connect to RDS automatically via .env file

---

## Verification

After deployment, check if backend connects to RDS:

```bash
# SSH to EC2
ssh -i devops-key ubuntu@43.205.116.130

# Check backend logs
docker logs backend

# You should see successful database connection logs
# Look for: "HikariPool-1 - Start completed"

# Check if tables are created
mysql -h devops-taskdb.ch6lrvzbxyz.us-east-1.rds.amazonaws.com \
      -u devops -pDevOps2026 taskdb

SHOW TABLES;
# Should show your application tables

# Describe tasks table
DESCRIBE tasks;
```

---

## RDS Endpoint Configuration Summary

Replace this value in your .env file:

```bash
DB_HOST=<YOUR-RDS-ENDPOINT>
```

Example:
```bash
DB_HOST=devops-taskdb.ch6lrvzbxyz.us-east-1.rds.amazonaws.com
```

---

## Important Notes

1. **Free Tier Limits:**
   - 750 hours per month of db.t3.micro instance
   - 20 GB of General Purpose (SSD) storage
   - 20 GB of backup storage
   - Valid for 12 months from AWS signup

2. **Security:**
   - Never commit .env file to Git
   - Use strong passwords in production
   - Restrict security group to specific IP/security group

3. **Performance:**
   - RDS in same region as EC2 for low latency
   - Consider Multi-AZ for production (not free tier)

4. **Backup:**
   - Enable automated backups (7 days retention is free)
   - Take manual snapshots before major changes

---

## Troubleshooting

### Connection Timeout

```bash
# Check security group allows port 3306
# Check VPC and subnet configuration
# Verify EC2 and RDS are in same VPC
```

### Access Denied

```bash
# Verify username and password
# Check user privileges
# Ensure user is created with '%' host or specific IP
```

### Database Not Found

```bash
# Create database manually
mysql -h <RDS-ENDPOINT> -u admin -p
CREATE DATABASE taskdb;
```

---

## Cleanup (To Avoid Charges)

When done, delete RDS instance:

1. Go to RDS > Databases
2. Select devops-taskdb
3. Actions > Delete
4. Uncheck "Create final snapshot" (for testing)
5. Type "delete me" to confirm
6. Delete

---

## Cost Optimization

- Use db.t3.micro (free tier eligible)
- Disable Multi-AZ (not needed for development)
- Disable automated backups if not needed
- Delete instance when not in use
- Monitor free tier usage in AWS Billing Dashboard
