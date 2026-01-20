# Task Tracker - Full Stack Application with CI/CD

A modern full-stack task management application built with Spring Boot backend and React frontend, featuring a complete CI/CD pipeline using Jenkins, Docker, and DockerHub.

## 🏗️ Architecture

```
Developer → GitHub → Jenkins (WSL) → Docker Build → DockerHub → Deployment
```

## 🚀 Tech Stack

### Backend

- **Framework**: Spring Boot 3.5.5
- **Language**: Java 17
- **Database**: MySQL 8.0
- **Build Tool**: Maven
- **Port**: 8000

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **Port**: 9000 (production via Nginx)

### DevOps

- **CI/CD**: Jenkins
- **Containerization**: Docker
- **Registry**: Docker Hub
- **Orchestration**: Docker Compose

## 📋 Features

- ✅ User authentication (Login/Signup)
- ✅ Create, Read, Update, Delete tasks
- ✅ Task status management (Pending, In Progress, Completed)
- ✅ Task priority levels (Low, Medium, High)
- ✅ Due date tracking
- ✅ Responsive UI design
- ✅ RESTful API backend
- ✅ Dockerized application
- ✅ Automated CI/CD pipeline

## 🔧 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 22+ (for local development)
- Java 17+ (for local development)
- Maven 3.6+ (for local development)

### Running with Docker Compose

```bash
# Clone the repository
git clone https://github.com/thisarasamuditha/task_tracker_devops.git
cd task_tracker_devops/version_2.0

# Start all services
docker-compose up -d

# Check container status
docker-compose ps

# View logs
docker-compose logs -f
```

### Accessing the Application

- **Frontend**: http://localhost:9000
- **Backend API**: http://localhost:8000
- **Database**: localhost:3307

### Default Database Credentials

- **Username**: root
- **Password**: Tt51714183.
- **Database**: task_tracker

## 🛠️ Local Development

### Backend Development

```bash
cd backend

# Build the project
mvn clean package

# Run tests
mvn test

# Run the application
mvn spring-boot:run
```

Backend will be available at: http://localhost:8000

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Frontend will be available at: http://localhost:5173 (Vite dev server)

## 🐳 Docker Images

Pre-built Docker images are available on Docker Hub:

- **Backend**: `thisarasamuditha/task_tracker_backend:latest`
- **Frontend**: `thisarasamuditha/task_tracker_frontend:latest`

```bash
# Pull images
docker pull thisarasamuditha/task_tracker_backend:latest
docker pull thisarasamuditha/task_tracker_frontend:latest
```

## 🔄 CI/CD Pipeline

### Pipeline Stages

1. **Checkout** - Clone code from GitHub
2. **Environment Setup** - Verify tools and dependencies
3. **Build Backend** - Compile Spring Boot application
4. **Test Backend** - Run JUnit tests
5. **Build Frontend** - Build React production bundle
6. **Build Docker Images** - Create Docker images (parallel)
7. **Security Scan** - Scan for vulnerabilities using Trivy
8. **Push to Docker Hub** - Publish images to registry
9. **Deploy** - Start containers with docker-compose
10. **Health Check** - Verify application is running

### Setting Up Jenkins

Detailed instructions available in [JENKINS_SETUP.md](./JENKINS_SETUP.md)

**Quick Setup:**

```bash
# Install Jenkins on WSL
sudo apt update
sudo apt install openjdk-17-jdk -y
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install jenkins -y
sudo systemctl start jenkins

# Access Jenkins at http://localhost:8080
```

### Triggering Builds

**Automatic**: Push to GitHub triggers webhook → Jenkins starts pipeline

**Manual**: Click "Build Now" in Jenkins dashboard

## 📁 Project Structure

```
version_2.0/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/       # Java source code
│   │   │   └── resources/  # Application properties
│   │   └── test/           # Unit tests
│   ├── Dockerfile          # Backend Docker configuration
│   └── pom.xml            # Maven configuration
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/           # API integration
│   │   ├── assets/        # Static assets
│   │   └── components/    # React components
│   ├── Dockerfile         # Frontend Docker configuration
│   ├── nginx.conf         # Nginx configuration
│   └── package.json       # npm configuration
├── docker-compose.yml     # Multi-container orchestration
├── Jenkinsfile           # CI/CD pipeline definition
├── JENKINS_SETUP.md      # Detailed Jenkins setup guide
└── README.md             # This file
```

## 🔐 Security

- Passwords stored using BCrypt hashing
- Environment variables for sensitive data
- Docker image vulnerability scanning with Trivy
- Nginx proxy for API requests
- CORS configuration for cross-origin requests

## 🧪 Testing

### Backend Tests

```bash
cd backend
mvn test
```

Test reports available in: `backend/target/surefire-reports/`

### Frontend Tests

```bash
cd frontend
npm run test
```

## 📊 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Tasks

- `GET /api/users/{userId}/tasks` - Get all tasks
- `POST /api/users/{userId}/tasks` - Create new task
- `PUT /api/users/{userId}/tasks/{taskId}` - Update task
- `DELETE /api/users/{userId}/tasks/{taskId}` - Delete task

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**

```bash
# Stop existing containers
docker-compose down

# Check what's using the port
lsof -i :8000  # Backend
lsof -i :9000  # Frontend
```

**Database Connection Error**

```bash
# Wait for database to be healthy
docker-compose ps

# Check database logs
docker-compose logs db
```

**Jenkins Build Fails**

```bash
# Check Jenkins logs
sudo journalctl -u jenkins -f

# Verify Docker permissions
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

## 📚 Documentation

- [Jenkins Setup Guide](./JENKINS_SETUP.md) - Complete Jenkins installation and configuration
- [Docker Setup Guide](./DOCKER_SETUP.md) - Docker configuration details
- [API Documentation](./API_DOCS.md) - API endpoint specifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Thisara Samuditha**

- GitHub: [@thisarasamuditha](https://github.com/thisarasamuditha)
- Docker Hub: [thisarasamuditha](https://hub.docker.com/u/thisarasamuditha)

## 🙏 Acknowledgments

- Spring Boot Documentation
- React Documentation
- Jenkins Documentation
- Docker Documentation

---

**Need Help?** Check out [JENKINS_SETUP.md](./JENKINS_SETUP.md) for detailed setup instructions!