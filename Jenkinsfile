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
        SSH_KEY = credentials('ec2-ssh-key')
    }
    
    triggers {
        // Trigger pipeline on GitHub push
        githubPush()
    }
    
    stages {
        // Stage 1: Pull code from GitHub
        stage('Checkout Code') {
            steps {
                echo 'Step 1: Pulling source code from GitHub repository'
                checkout scm
            }
        }
        
        // Stage 2: Build Docker images
        stage('Build Docker Images') {
            steps {
                echo 'Step 2: Building Docker images for Frontend and Backend'
                script {
                    // Build backend image
                    dir('backend') {
                        sh """
                            docker build -t ${BACKEND_IMAGE}:latest .
                            docker tag ${BACKEND_IMAGE}:latest ${BACKEND_IMAGE}:${BUILD_TAG}
                        """
                    }
                    
                    // Build frontend image
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
        
        // Stage 3: Push images to DockerHub
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
        
        // Stage 4: Deploy to AWS EC2 using Ansible
 stage('Deploy to AWS EC2') {
    steps {
        echo 'Step 4: Deploying application to AWS EC2 using Ansible'
        script {
            dir('ansible') {
                withCredentials([
                    file(credentialsId: 'ec2-ssh-key', variable: 'SSH_KEY_FILE')
                ]) {
                    sh """
                        # Update inventory with EC2 IP
                        sed -i 's/<EC2_PUBLIC_IP>/${EC2_HOST}/g' inventory.ini
                        
                        # Set proper permissions for SSH key
                        chmod 600 \${SSH_KEY_FILE}
                        
                        # Run Ansible playbook with SSH key
                        ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i inventory.ini deploy.yml \
                          --private-key=\${SSH_KEY_FILE} \
                          --extra-vars "docker_username=${DOCKER_USERNAME}" \
                          --extra-vars "docker_password=${DOCKERHUB_CREDENTIALS_PSW}"
                    """
                }
            }
        }
    }
}
        
        // Stage 5: Verify deployment
        stage('Verify Deployment') {
            steps {
                echo 'Step 5: Verifying application deployment'
                sh """
                    # Wait for services to stabilize
                    sleep 30
                    
                    # Check if frontend is accessible
                    curl -f http://${EC2_HOST} || echo 'Warning: Frontend not responding'
                    
                    # Check if backend is accessible
                    curl -f http://${EC2_HOST}:8088/api || echo 'Warning: Backend not responding'
                """
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully'
            echo "Frontend URL: http://${EC2_HOST}"
            echo "Backend API URL: http://${EC2_HOST}:8088/api"
            echo "Database: mysql://${EC2_HOST}:3306/taskdb"
        }
        failure {
            echo 'Pipeline failed. Check logs for details.'
        }
        cleanup {
            script {
                // Cleanup Docker credentials and unused images
                sh 'docker logout || true'
                sh 'docker image prune -f || true'
            }
        }
    }
}