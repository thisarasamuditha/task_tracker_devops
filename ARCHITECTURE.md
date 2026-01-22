# Architecture Diagrams

## 1. Complete CI/CD Pipeline with Database

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│Developer │────▶│  GitHub  │────▶│ Jenkins  │────▶│DockerHub │────▶│ Ansible  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
    Push              Webhook        Build/Test       Push Images      Deploy
    Code              Trigger        Images                            
                                         │                                  │
                                         ▼                                  ▼
                                    ┌─────────────────────────────────────────┐
                                    │        AWS EC2 (t3.micro)               │
                                    │  ┌───────────────────────────────────┐  │
                                    │  │   Docker Compose Orchestration    │  │
                                    │  │                                   │  │
                                    │  │   ┌──────────┐   ┌──────────┐   │  │
                                    │  │   │ Frontend │   │ Backend  │   │  │
                                    │  │   │  Nginx   │──▶│  Spring  │   │  │
                                    │  │   │ Port 80  │   │Port 8080 │   │  │
                                    │  │   └──────────┘   └────┬─────┘   │  │
                                    │  │                        │         │  │
                                    │  │                        ▼         │  │
                                    │  │                  ┌──────────┐   │  │
                                    │  │                  │  MySQL   │   │  │
                                    │  │                  │ Database │   │  │
                                    │  │                  │Port 3306 │   │  │
                                    │  │                  └────┬─────┘   │  │
                                    │  │                       │         │  │
                                    │  │                  ┌────▼─────┐   │  │
                                    │  │                  │  Volume  │   │  │
                                    │  │                  │mysql_data│   │  │
                                    │  │                  └──────────┘   │  │
                                    │  └───────────────────────────────────┘  │
                                    └─────────────────────────────────────────┘
                                                    ▲
                                                    │
                                              ┌─────┴─────┐
                                              │   Users   │
                                              │  Access   │
                                              └───────────┘
```

---

## 2. Container Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network: app-network              │
│                                                             │
│  ┌────────────────┐        ┌────────────────┐             │
│  │   Frontend     │   HTTP │    Backend     │             │
│  │   Container    │───────▶│   Container    │             │
│  │                │        │                │             │
│  │  - React App   │        │  - Spring Boot │             │
│  │  - Nginx       │        │  - Java 17     │             │
│  │  - Port 80     │        │  - Port 8080   │             │
│  │                │        │                │             │
│  └────────────────┘        └───────┬────────┘             │
│         │                          │                       │
│         │                          │ JDBC Connection       │
│         │                          │ jdbc:mysql://db:3306  │
│         │                          │                       │
│         │                  ┌───────▼────────┐             │
│         │                  │    Database    │             │
│         │                  │   Container    │             │
│         │                  │                │             │
│         │                  │  - MySQL 8.0   │             │
│         │                  │  - Port 3306   │             │
│         │                  │                │             │
│         │                  └───────┬────────┘             │
│         │                          │                       │
│         │                  ┌───────▼────────┐             │
│         │                  │  Persistent    │             │
│         │                  │    Volume      │             │
│         │                  │  mysql_data    │             │
│         │                  └────────────────┘             │
│         │                                                  │
│    Port Mapping                                           │
│    (Host → Container)                                     │
│         │                                                  │
│   ┌─────▼──────────────────────────────────────┐         │
│   │  80 → 80 (Frontend)                        │         │
│   │  8080 → 8080 (Backend)                     │         │
│   │  3306 → 3306 (Database - Optional)         │         │
│   └────────────────────────────────────────────┘         │
│                                                            │
└────────────────────────────────────────────────────────────┘
                              ▲
                              │
                     External Access
                    http://<EC2_IP>
```

---

## 3. Memory Allocation (t3.micro - 1GB RAM)

```
┌────────────────────────────────────────────────┐
│          EC2 Instance (1GB Total RAM)          │
├────────────────────────────────────────────────┤
│                                                │
│  MySQL Container                               │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 300MB (30%)                  │
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│  Backend Container                             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 400MB (40%)            │
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│  Frontend Container                            │
│  ▓▓▓▓▓▓▓▓▓▓ 200MB (20%)                       │
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│  System / Buffer                               │
│  ▓▓▓▓▓ ~100MB (10%)                           │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 4. Jenkins Build Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                    Jenkins Pipeline                          │
└──────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────┐
│  Stage 1:       │  Pull code from GitHub
│  Checkout       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Stage 2:       │  docker build -t backend:${BUILD_TAG}
│  Build Backend  │  docker tag backend:${BUILD_TAG} backend:latest
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Stage 3:       │  docker build -t frontend:${BUILD_TAG}
│  Build Frontend │  docker tag frontend:${BUILD_TAG} frontend:latest
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Stage 4:       │  docker push backend:${BUILD_TAG}
│  Push Images    │  docker push backend:latest
│  to DockerHub   │  docker push frontend:${BUILD_TAG}
│                 │  docker push frontend:latest
└────────┬────────┘  (MySQL pulled automatically from DockerHub)
         │
         ▼
┌─────────────────┐
│  Stage 5:       │  Update docker-compose.yml
│  Update Config  │  Update inventory.ini with EC2 IP
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Stage 6:       │  ansible-playbook -i inventory.ini deploy.yml
│  Deploy with    │  - Installs Docker on EC2
│  Ansible        │  - Copies docker-compose.yml
│                 │  - Runs: docker compose pull
│                 │  - Runs: docker compose up -d
└────────┬────────┘       (Pulls: frontend, backend, mysql)
         │
         ▼
┌─────────────────┐
│  Success!       │  Application deployed at http://<EC2_IP>
│  Deployment     │  Frontend: Port 80
│  Complete       │  Backend: Port 8080
│                 │  Database: Port 3306 (internal)
└─────────────────┘
```

---

## 5. Data Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ HTTP Request
     │ http://<EC2_IP>
     │
     ▼
┌──────────────────┐
│  Nginx (Port 80) │
│                  │
│  - Serves React  │
│  - Static files  │
└────┬─────────────┘
     │
     │ API Request
     │ http://backend:8080/api
     │
     ▼
┌─────────────────────────┐
│  Spring Boot (Port 8080)│
│                         │
│  - REST Controllers     │
│  - Business Logic       │
│  - JPA/Hibernate        │
└────┬────────────────────┘
     │
     │ JDBC Connection
     │ jdbc:mysql://db:3306/taskdb
     │ Username: devops
     │ Password: DevOps@2026
     │
     ▼
┌─────────────────────────┐
│  MySQL (Port 3306)      │
│                         │
│  - Database: taskdb     │
│  - Tables: users, tasks │
│  - Persistent Storage   │
└────┬────────────────────┘
     │
     │ Data Persistence
     │
     ▼
┌─────────────────────────┐
│  Docker Volume          │
│  mysql_data             │
│                         │
│  - /var/lib/mysql       │
│  - Survives restarts    │
└─────────────────────────┘
```

---

## 6. Deployment States

```
┌──────────────────────────────────────────────────────────┐
│                   Initial State                          │
│                                                          │
│  EC2 Instance (Fresh)                                    │
│  - No Docker installed                                   │
│  - No containers running                                 │
│  - No volumes created                                    │
└──────────────────────────────────────────────────────────┘
                          │
                          │ Ansible Playbook
                          │ (First Run)
                          ▼
┌──────────────────────────────────────────────────────────┐
│                   After Ansible                          │
│                                                          │
│  EC2 Instance                                            │
│  ✅ Docker installed                                     │
│  ✅ Docker Compose installed                             │
│  ✅ docker-compose.yml copied                            │
│  ✅ Volume created: mysql_data                           │
│  ✅ Containers running:                                  │
│     - mysql_db (initializing...)                         │
│     - backend (waiting for db...)                        │
│     - frontend (running)                                 │
└──────────────────────────────────────────────────────────┘
                          │
                          │ Wait ~30 seconds
                          │ MySQL initialization
                          ▼
┌──────────────────────────────────────────────────────────┐
│                   Fully Running                          │
│                                                          │
│  EC2 Instance                                            │
│  ✅ All containers healthy                               │
│  ✅ MySQL ready for connections                          │
│  ✅ Backend connected to database                        │
│  ✅ Frontend serving users                               │
│  ✅ Application fully functional                         │
└──────────────────────────────────────────────────────────┘
```

---

## 7. Security Group Configuration

```
┌────────────────────────────────────────────────────────┐
│           AWS Security Group (Firewall)                │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Inbound Rules:                                        │
│                                                        │
│  ┌──────────────────────────────────────────┐         │
│  │ Port 22 (SSH)                            │         │
│  │ Source: 0.0.0.0/0                        │         │
│  │ Purpose: SSH access for management       │         │
│  └──────────────────────────────────────────┘         │
│                                                        │
│  ┌──────────────────────────────────────────┐         │
│  │ Port 80 (HTTP)                           │         │
│  │ Source: 0.0.0.0/0                        │         │
│  │ Purpose: Frontend web access             │         │
│  └──────────────────────────────────────────┘         │
│                                                        │
│  ┌──────────────────────────────────────────┐         │
│  │ Port 8080 (HTTP)                         │         │
│  │ Source: 0.0.0.0/0                        │         │
│  │ Purpose: Backend API access              │         │
│  └──────────────────────────────────────────┘         │
│                                                        │
│  ┌──────────────────────────────────────────┐         │
│  │ Port 3306 (MySQL)                        │         │
│  │ Source: 0.0.0.0/0                        │         │
│  │ Purpose: Database access (optional)      │         │
│  │ ⚠️  Can be removed for production        │         │
│  └──────────────────────────────────────────┘         │
│                                                        │
│  Outbound Rules:                                       │
│                                                        │
│  ┌──────────────────────────────────────────┐         │
│  │ All traffic                              │         │
│  │ Destination: 0.0.0.0/0                   │         │
│  │ Purpose: Download packages, Docker pull  │         │
│  └──────────────────────────────────────────┘         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 8. File Structure Overview

```
project/
├── frontend/
│   ├── Dockerfile ────────────────┐
│   ├── nginx.conf                 │
│   ├── src/                       │ Built by Jenkins
│   └── package.json               │ Pushed to DockerHub
│                                  │
├── backend/                       │
│   ├── Dockerfile ────────────────┤
│   ├── pom.xml                    │
│   └── src/                       │
│       └── resources/             │
│           └── application-prod.properties (DB config)
│
├── docker-compose.yml ────────┐
│   - Defines 3 services:      │
│     * frontend               │
│     * backend                │ Copied to EC2
│     * db (MySQL)             │ by Ansible
│   - Defines volume           │
│   - Defines network          │
│                               │
├── terraform/                  │
│   ├── main.tf                │
│   ├── devops-key (private)   │
│   └── devops-key.pub          │
│                               │
├── ansible/                    │
│   ├── inventory.ini           │
│   └── deploy.yml ─────────────┘
│       - Installs Docker
│       - Copies docker-compose.yml
│       - Runs docker compose up -d
│
├── Jenkinsfile
│   - Builds frontend & backend
│   - Pushes to DockerHub
│   - Triggers Ansible
│
└── README.md
    - Complete documentation
```

---

## Legend

```
▶  Arrow / Flow direction
┌─┐ Box / Container
│  │ Vertical line
─  Horizontal line
├─┤ T-junction
└─┘ Corner
▓  Filled area / Usage indicator
```
