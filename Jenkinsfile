pipeline {
    agent any
    
    environment {
        // DockerHub credentials
        DOCKER_USERNAME = 'thisarasamuditha'
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        
        // Docker image names
        FRONTEND_IMAGE = "${DOCKER_USERNAME}/frontend"
        BACKEND_IMAGE = "${DOCKER_USERNAME}/backend"
        
        // Build tag using Jenkins build number
        BUILD_TAG = "${env.BUILD_NUMBER}"
        
        // AWS EC2 configuration
        EC2_HOST = '43.205.116.130'
        EC2_USER = 'ubuntu'
    }
    
    triggers {
        githubPush()
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                echo 'Step 1: Pulling source code from GitHub repository'
                checkout scm
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo 'Step 2: Building Docker images for Frontend and Backend'
                script {
                    // Build Backend
                    dir('backend') {
                        sh """
                            docker build -t ${BACKEND_IMAGE}:latest .
                            docker tag ${BACKEND_IMAGE}:latest ${BACKEND_IMAGE}:${BUILD_TAG}
                        """
                    }
                    
                    // Build Frontend
                    dir('frontend') {
                        sh """
                            docker build -t ${FRONTEND_IMAGE}:latest \
                              --build-arg VITE_API_BASE_URL=http://${EC2_HOST}:8088/api .
                            docker tag ${FRONTEND_IMAGE}:latest ${FRONTEND_IMAGE}:${BUILD_TAG}
                        """
                    }
                }
            }
        }
        
        stage('Push to DockerHub') {
            steps {
                echo 'Step 3: Pushing Docker images to DockerHub'
                sh """
                    echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin
                    
                    docker push ${BACKEND_IMAGE}:latest
                    docker push ${BACKEND_IMAGE}:${BUILD_TAG}
                    docker push ${FRONTEND_IMAGE}:latest
                    docker push ${FRONTEND_IMAGE}:${BUILD_TAG}
                    
                    docker logout
                """
            }
        }
        
        stage('Deploy to AWS EC2') {
            steps {
                echo 'Step 4: Deploying application to AWS EC2 using Ansible'
                script {
                    dir('ansible') {
                        withCredentials([
                            file(credentialsId: 'ec2-ssh-key', variable: 'SSH_KEY_FILE')
                        ]) {
                            sh """
                                # Set proper permissions for SSH key
                                chmod 600 \${SSH_KEY_FILE}
                                
                                # Display configuration
                                echo "=== Deployment Configuration ==="
                                echo "Target Host: ${EC2_HOST}"
                                echo "Docker Username: ${DOCKER_USERNAME}"
                                echo "Using SSH Key: \${SSH_KEY_FILE}"
                                echo "================================"
                                
                                # Display inventory
                                echo "=== Ansible Inventory ==="
                                cat inventory.ini
                                echo "========================="
                                
                                # Run Ansible playbook
                                ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook \
                                  -i inventory.ini \
                                  deploy.yml \
                                  --private-key=\${SSH_KEY_FILE} \
                                  --extra-vars "docker_username=${DOCKER_USERNAME}" \
                                  --extra-vars "docker_password=${DOCKERHUB_CREDENTIALS_PSW}" \
                                  -v
                            """
                        }
                    }
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo 'Step 5: Verifying application deployment'
                script {
                    sh """
                        # Wait for services to stabilize
                        echo "Waiting 30 seconds for services to start..."
                        sleep 30
                        
                        # Test Frontend
                        echo "Testing Frontend..."
                        curl -f http://${EC2_HOST} -o /dev/null -w "Frontend Status: %{http_code}\\n" || echo "Frontend not responding"
                        
                        # Test Backend API
                        echo "Testing Backend API..."
                        curl -f http://${EC2_HOST}:8088/api -o /dev/null -w "Backend Status: %{http_code}\\n" || echo "Backend not responding"
                        
                        # Display running containers via SSH
                        echo "Checking running containers on EC2..."
                    """
                    
                    // Optional: SSH check
                    withCredentials([
                        file(credentialsId: 'ec2-ssh-key', variable: 'SSH_KEY_FILE')
                    ]) {
                        sh """
                            chmod 600 \${SSH_KEY_FILE}
                            ssh -o StrictHostKeyChecking=no -i \${SSH_KEY_FILE} ${EC2_USER}@${EC2_HOST} \
                              "docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'"
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '================================'
            echo 'Pipeline completed successfully!'
            echo '================================'
            echo "Frontend URL: http://${EC2_HOST}"
            echo "Backend API URL: http://${EC2_HOST}:8088/api"
            echo "Database: mysql://${EC2_HOST}:3306/taskdb"
            echo '================================'
        }
        failure {
            echo '================================'
            echo 'Pipeline failed!'
            echo 'Check logs above for details.'
            echo '================================'
        }
        cleanup {
            script {
                sh 'docker logout || true'
                sh 'docker image prune -f || true'
            }
        }
    }
}