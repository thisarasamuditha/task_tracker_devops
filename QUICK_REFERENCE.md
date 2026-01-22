# Quick Reference: MySQL Database Integration

## ⚡ Quick Start

### 1. Update docker-compose.yml
Replace `YOUR_DOCKERHUB_USERNAME` with your DockerHub username on lines 28 and 51.

### 2. Test Locally
```bash
docker-compose up -d
docker ps
docker logs mysql_db
docker logs backend
```

### 3. Deploy to EC2
```bash
# Commit changes
git add .
git commit -m "Add MySQL database"
git push

# Trigger Jenkins build or run manually
```

---

## 🔑 Database Credentials

```
Host: db (container name)
Port: 3306
Database: taskdb
Username: devops
Password: DevOps@2026
Root Password: DevOps@2026
```

---

## 📊 Memory Usage (t3.micro = 1GB)

| Container | Memory Limit | Percentage |
|-----------|-------------|------------|
| MySQL     | 300MB       | 30%        |
| Backend   | 400MB       | 40%        |
| Frontend  | 200MB       | 20%        |
| System    | ~100MB      | 10%        |

---

## 🐳 Docker Commands

### Check Status
```bash
docker ps
docker stats --no-stream
```

### View Logs
```bash
docker logs mysql_db
docker logs backend
docker logs frontend
```

### Database Access
```bash
# Connect to MySQL shell
docker exec -it mysql_db mysql -u devops -pDevOps@2026 taskdb

# Run SQL query
docker exec mysql_db mysql -u devops -pDevOps@2026 taskdb -e "SHOW TABLES;"

# Check databases
docker exec mysql_db mysql -u devops -pDevOps@2026 -e "SHOW DATABASES;"
```

### Restart Containers
```bash
# Restart all
docker-compose restart

# Restart specific container
docker restart mysql_db
docker restart backend

# Full restart
docker-compose down
docker-compose up -d
```

---

## 🔧 Troubleshooting

### Backend can't connect to database
```bash
# Wait for MySQL to be ready
docker logs mysql_db | grep "ready for connections"

# Restart backend
docker restart backend

# Check backend logs
docker logs backend | grep -i "mysql\|database\|connection"
```

### Out of memory
```bash
# Check memory
free -h
docker stats

# Add to docker-compose.yml under db service:
command: --innodb-buffer-pool-size=128M
```

### Data lost after restart
```bash
# Check volume exists
docker volume ls | grep mysql_data
docker volume inspect mysql_data

# If volume missing, recreate:
docker-compose down
docker volume create mysql_data
docker-compose up -d
```

### Port conflict
```bash
# Check what's using ports
sudo lsof -i :3306
sudo lsof -i :8080
sudo lsof -i :80

# Kill process
sudo kill -9 <PID>
```

---

## 📝 Important Files Changed

1. ✅ `docker-compose.yml` - Added MySQL service
2. ✅ `backend/src/main/resources/application-prod.properties` - Database config
3. ✅ `terraform/main.tf` - Added port 3306 to security group
4. ✅ `README.md` - Added database documentation
5. ❌ `Jenkinsfile` - No changes (MySQL pulled from DockerHub)
6. ❌ `ansible/deploy.yml` - No changes (already handles docker-compose)

---

## 🚀 Deployment Checklist

- [ ] Replace `YOUR_DOCKERHUB_USERNAME` in docker-compose.yml
- [ ] Test locally with `docker-compose up -d`
- [ ] Verify MySQL container is healthy
- [ ] Check backend connects to database
- [ ] Commit and push changes to GitHub
- [ ] Trigger Jenkins build
- [ ] Verify deployment on EC2
- [ ] Test application functionality

---

## 📞 Health Checks

### MySQL Health
```bash
# Check if MySQL is ready
docker exec mysql_db mysqladmin ping -h localhost -u root -pDevOps@2026

# Check connection from backend
docker exec backend curl -f http://localhost:8080/actuator/health || echo "Backend not ready"
```

### Application URLs
```
Frontend:  http://<EC2_IP>
Backend:   http://<EC2_IP>:8080
Database:  <EC2_IP>:3306 (internal only)
```

---

## 🔄 Data Management

### Backup Database
```bash
# Backup
docker exec mysql_db mysqldump -u devops -pDevOps@2026 taskdb > backup.sql

# Restore
docker exec -i mysql_db mysql -u devops -pDevOps@2026 taskdb < backup.sql
```

### Clear All Data
```bash
docker-compose down -v  # ⚠️ This deletes volumes!
docker-compose up -d
```

---

## 📚 Additional Resources

- Full documentation: `README.md`
- Detailed changes: `DATABASE_SETUP.md`
- MySQL official docs: https://hub.docker.com/_/mysql
- Spring Boot MySQL: https://spring.io/guides/gs/accessing-data-mysql/
