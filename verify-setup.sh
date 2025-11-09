#!/bin/bash

# Jenkins Environment Verification Script
# Checks if all required tools are properly installed for the CI/CD pipeline

echo "=========================================="
echo "Jenkins Environment Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        $2
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        return 1
    fi
}

check_service() {
    if sudo systemctl is-active --quiet $1; then
        echo -e "${GREEN}✓${NC} $1 service is running"
        return 0
    else
        echo -e "${RED}✗${NC} $1 service is NOT running"
        return 1
    fi
}

echo "Checking Required Tools:"
echo "------------------------"

# Check Java
check_command "java" "java -version 2>&1 | head -1"

# Check Maven
check_command "mvn" "mvn -version | head -1"

# Check Node.js
check_command "node" "echo '  Version: $(node --version)'"

# Check npm
check_command "npm" "echo '  Version: $(npm --version)'"

# Check Docker
check_command "docker" "docker --version"

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    check_command "docker-compose" "docker-compose --version"
elif docker compose version &> /dev/null; then
    echo -e "${GREEN}✓${NC} docker compose (plugin) is installed"
    docker compose version
fi

# Check Git
check_command "git" "git --version"

# Check Trivy (optional)
if command -v trivy &> /dev/null; then
    check_command "trivy" "trivy --version | head -1"
else
    echo -e "${YELLOW}○${NC} trivy is NOT installed (optional for security scanning)"
fi

echo ""
echo "Checking Services:"
echo "------------------"

# Check Jenkins service
check_service "jenkins"

# Check Docker service
check_service "docker"

echo ""
echo "Checking Permissions:"
echo "---------------------"

# Check if user is in docker group
if groups | grep -q docker; then
    echo -e "${GREEN}✓${NC} Current user is in docker group"
else
    echo -e "${RED}✗${NC} Current user is NOT in docker group"
    echo "  Run: sudo usermod -aG docker \$USER && newgrp docker"
fi

# Check if jenkins user is in docker group
if groups jenkins 2>/dev/null | grep -q docker; then
    echo -e "${GREEN}✓${NC} Jenkins user is in docker group"
else
    echo -e "${RED}✗${NC} Jenkins user is NOT in docker group"
    echo "  Run: sudo usermod -aG docker jenkins && sudo systemctl restart jenkins"
fi

echo ""
echo "Checking Ports:"
echo "---------------"

# Check Jenkins port
if netstat -tuln 2>/dev/null | grep -q ":8080"; then
    echo -e "${GREEN}✓${NC} Port 8080 is in use (Jenkins)"
elif ss -tuln 2>/dev/null | grep -q ":8080"; then
    echo -e "${GREEN}✓${NC} Port 8080 is in use (Jenkins)"
else
    echo -e "${YELLOW}○${NC} Port 8080 is not in use"
fi

# Check if application ports are available
for port in 8000 9000 3307; do
    if netstat -tuln 2>/dev/null | grep -q ":$port" || ss -tuln 2>/dev/null | grep -q ":$port"; then
        echo -e "${YELLOW}○${NC} Port $port is in use"
    else
        echo -e "${GREEN}✓${NC} Port $port is available"
    fi
done

echo ""
echo "Docker Information:"
echo "-------------------"

if command -v docker &> /dev/null; then
    echo "Docker Images:"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | head -5
    echo ""
    
    echo "Running Containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "  No containers running"
fi

echo ""
echo "Jenkins Status:"
echo "---------------"

if [ -f /var/lib/jenkins/secrets/initialAdminPassword ]; then
    echo -e "${GREEN}✓${NC} Jenkins initial setup is pending"
    echo "  Initial Password: $(sudo cat /var/lib/jenkins/secrets/initialAdminPassword)"
    echo "  Access Jenkins at: http://localhost:8080"
else
    echo -e "${GREEN}✓${NC} Jenkins is configured"
    echo "  Access Jenkins at: http://localhost:8080"
fi

echo ""
echo "Project Files:"
echo "--------------"

# Check if Jenkinsfile exists
if [ -f "./Jenkinsfile" ]; then
    echo -e "${GREEN}✓${NC} Jenkinsfile exists"
else
    echo -e "${RED}✗${NC} Jenkinsfile NOT found"
fi

# Check if docker-compose.yml exists
if [ -f "./docker-compose.yml" ]; then
    echo -e "${GREEN}✓${NC} docker-compose.yml exists"
else
    echo -e "${RED}✗${NC} docker-compose.yml NOT found"
fi

# Check if backend Dockerfile exists
if [ -f "./backend/Dockerfile" ]; then
    echo -e "${GREEN}✓${NC} Backend Dockerfile exists"
else
    echo -e "${RED}✗${NC} Backend Dockerfile NOT found"
fi

# Check if frontend Dockerfile exists
if [ -f "./frontend/Dockerfile" ]; then
    echo -e "${GREEN}✓${NC} Frontend Dockerfile exists"
else
    echo -e "${RED}✗${NC} Frontend Dockerfile NOT found"
fi

echo ""
echo "=========================================="
echo "Verification Complete!"
echo "=========================================="
echo ""

# Summary
echo "Summary:"
echo "--------"

all_ok=true

# Check critical components
if ! command -v java &> /dev/null; then all_ok=false; fi
if ! command -v mvn &> /dev/null; then all_ok=false; fi
if ! command -v node &> /dev/null; then all_ok=false; fi
if ! command -v docker &> /dev/null; then all_ok=false; fi
if ! sudo systemctl is-active --quiet jenkins; then all_ok=false; fi

if [ "$all_ok" = true ]; then
    echo -e "${GREEN}✓ All critical components are ready!${NC}"
    echo ""
    echo "You can now:"
    echo "  1. Access Jenkins at http://localhost:8080"
    echo "  2. Configure Jenkins credentials"
    echo "  3. Create a pipeline job"
    echo "  4. Push code to trigger the pipeline"
else
    echo -e "${RED}✗ Some components are missing or not configured properly${NC}"
    echo ""
    echo "Please install missing components and try again."
    echo "Refer to JENKINS_SETUP.md for detailed instructions."
fi

echo ""
