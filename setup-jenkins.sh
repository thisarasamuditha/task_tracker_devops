#!/bin/bash

# Jenkins Quick Setup Script for WSL
# This script automates the installation and configuration of Jenkins on WSL

set -e

echo "=========================================="
echo "Jenkins CI/CD Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on WSL
if ! grep -qi microsoft /proc/version; then
    print_error "This script is designed for WSL. Please run on WSL."
    exit 1
fi

print_info "Detected WSL environment. Proceeding with installation..."
echo ""

# Update package list
print_info "Updating package list..."
sudo apt update -y

# Install Java 17
print_info "Installing Java 17..."
sudo apt install openjdk-17-jdk -y

# Verify Java installation
java_version=$(java -version 2>&1 | head -1 | cut -d'"' -f2)
print_info "Java version installed: $java_version"
echo ""

# Install Jenkins
print_info "Adding Jenkins repository..."
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

print_info "Updating package list..."
sudo apt update -y

print_info "Installing Jenkins..."
sudo apt install jenkins -y

# Start Jenkins
print_info "Starting Jenkins service..."
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Wait for Jenkins to start
print_info "Waiting for Jenkins to initialize..."
sleep 15

# Check Jenkins status
if sudo systemctl is-active --quiet jenkins; then
    print_info "Jenkins is running successfully!"
else
    print_error "Jenkins failed to start. Check logs with: sudo journalctl -u jenkins -f"
    exit 1
fi

echo ""
print_info "Installing additional required tools..."
echo ""

# Install Node.js
print_info "Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

node_version=$(node --version)
npm_version=$(npm --version)
print_info "Node.js version: $node_version"
print_info "npm version: $npm_version"

# Install Maven
print_info "Installing Maven..."
sudo apt install maven -y

mvn_version=$(mvn -version | head -1)
print_info "Maven: $mvn_version"

# Install Docker (if not installed)
if ! command -v docker &> /dev/null; then
    print_info "Installing Docker..."
    
    sudo apt-get update
    sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    print_info "Docker installed successfully!"
else
    print_info "Docker is already installed"
fi

docker_version=$(docker --version)
print_info "$docker_version"

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_info "Installing Docker Compose..."
    sudo apt install docker-compose -y
fi

compose_version=$(docker-compose --version)
print_info "$compose_version"

# Add Jenkins and current user to docker group
print_info "Adding Jenkins to docker group..."
sudo usermod -aG docker jenkins
sudo usermod -aG docker $USER

# Install Trivy (optional - for security scanning)
print_info "Installing Trivy for security scanning..."
sudo apt-get install -y wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy -y

trivy_version=$(trivy --version | head -1)
print_info "$trivy_version"

# Restart Jenkins to apply group changes
print_info "Restarting Jenkins to apply changes..."
sudo systemctl restart jenkins

# Wait for Jenkins to restart
sleep 10

echo ""
echo "=========================================="
print_info "Jenkins installation completed!"
echo "=========================================="
echo ""

# Get Jenkins initial admin password
if [ -f /var/lib/jenkins/secrets/initialAdminPassword ]; then
    initial_password=$(sudo cat /var/lib/jenkins/secrets/initialAdminPassword)
    print_info "Jenkins is accessible at: http://localhost:8080"
    echo ""
    print_info "Initial Admin Password:"
    echo -e "${YELLOW}$initial_password${NC}"
    echo ""
fi

print_info "Installation Summary:"
echo "  ✅ Java 17"
echo "  ✅ Jenkins"
echo "  ✅ Node.js & npm"
echo "  ✅ Maven"
echo "  ✅ Docker"
echo "  ✅ Docker Compose"
echo "  ✅ Trivy"
echo ""

print_info "Next Steps:"
echo "  1. Open Jenkins in browser: http://localhost:8080"
echo "  2. Use the initial admin password shown above"
echo "  3. Install suggested plugins"
echo "  4. Create your admin user"
echo "  5. Add Docker Hub credentials in Jenkins"
echo "  6. Create a new Pipeline job"
echo "  7. Configure webhook in GitHub"
echo ""

print_info "Refer to JENKINS_SETUP.md for detailed configuration steps!"
echo ""

print_warn "IMPORTANT: You may need to logout and login again for docker group changes to take effect."
print_warn "Or run: newgrp docker"
echo ""

echo "=========================================="
print_info "Setup complete! 🚀"
echo "=========================================="
