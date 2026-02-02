pipeline {
    agent any
    
    environment {
        DOCKERHUB_USERNAME = 'thisarasamuditha'
        IMAGE_TAG = "${BUILD_NUMBER}"
        EC2_HOST = '43.205.116.130'
        EC2_USER = 'ubuntu'
        APP_DIR = '/home/ubuntu/app'
    }
    
    stages {
        // Stage 1: Checkout
        stage('Checkout') {
            steps {
                echo 'Stage 1: Pulling latest source code from GitHub repository'
                checkout scm
            }
        }
        
        // Stage 2: Build Backend Image
        stage('Build Backend Image') {
            steps {
                echo 'Stage 2: Building Spring Boot backend Docker image'
                script {
                    dir('backend') {
                        sh """
                            docker build -t ${DOCKERHUB_USERNAME}/backend:${IMAGE_TAG} \
                                         -t ${DOCKERHUB_USERNAME}/backend:latest .
                        """
                    }
                }
            }
        }
        
        // Stage 3: Build Frontend Image
        stage('Build Frontend Image') {
            steps {
                echo 'Stage 3: Building React frontend Docker image'
                script {
                    dir('frontend') {
                        sh """
                            docker build --build-arg VITE_API_BASE_URL=http://${EC2_HOST}:8088/api \
                                         -t ${DOCKERHUB_USERNAME}/frontend:${IMAGE_TAG} \
                                         -t ${DOCKERHUB_USERNAME}/frontend:latest .
                        """
                    }
                }
            }
        }
        
        // Stage 4: Push Images to DockerHub
        stage('Push Images to DockerHub') {
            steps {
                echo 'Stage 4: Authenticating with DockerHub and pushing images'
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh """
                            echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                            docker push ${DOCKERHUB_USERNAME}/backend:${IMAGE_TAG}
                            docker push ${DOCKERHUB_USERNAME}/backend:latest
                            docker push ${DOCKERHUB_USERNAME}/frontend:${IMAGE_TAG}
                            docker push ${DOCKERHUB_USERNAME}/frontend:latest
                            docker logout
                        """
                    }
                }
            }
        }
        
        // Stage 5: Update docker-compose Configuration
        stage('Update docker-compose Configuration') {
            steps {
                echo 'Stage 5: Updating docker-compose.yml with DockerHub username'
                script {
                    sh """
                        sed -i 's|image: .*/backend:|image: ${DOCKERHUB_USERNAME}/backend:|g' docker-compose.yml
                        sed -i 's|image: .*/frontend:|image: ${DOCKERHUB_USERNAME}/frontend:|g' docker-compose.yml
                    """
                }
            }
        }
        
        // Stage 6: Deploy to EC2 using Ansible
        stage('Deploy to EC2 using Ansible') {
            steps {
                echo 'Stage 6: Deploying application to EC2 instance via Ansible'
                script {
                    withCredentials([sshUserPrivateKey(
                        credentialsId: 'ec2-ssh-key',
                        keyFileVariable: 'SSH_KEY_FILE',
                        usernameVariable: 'SSH_USER'
                    )]) {
                        dir('ansible') {
                            sh """
                                ansible-playbook -i inventory.ini deploy.yml \
                                    --private-key=\${SSH_KEY_FILE} \
                                    --extra-vars "dockerhub_username=${DOCKERHUB_USERNAME} ansible_host=${EC2_HOST}"
                            """
                        }
                    }
                }
            }
        }
    }
    
    // Stage 7: Post Actions
    post {
        success {
            echo '========================================='
            echo 'Pipeline completed successfully'
            echo '========================================='
            echo "Frontend URL: http://${EC2_HOST}"
            echo "Backend API: http://${EC2_HOST}:8088/api"
            echo "Database: mysql://${EC2_HOST}:3306/taskdb"
            echo "Build Number: ${IMAGE_TAG}"
            echo '========================================='
        }
        failure {
            echo '========================================='
            echo 'Pipeline execution failed'
            echo 'Check the console output for details'
            echo '========================================='
        }
        always {
            echo 'Cleaning up temporary Docker images'
            sh """
                docker rmi ${DOCKERHUB_USERNAME}/backend:${IMAGE_TAG} || true
                docker rmi ${DOCKERHUB_USERNAME}/backend:latest || true
                docker rmi ${DOCKERHUB_USERNAME}/frontend:${IMAGE_TAG} || true
                docker rmi ${DOCKERHUB_USERNAME}/frontend:latest || true
                docker image prune -f || true
            """
        }
    }
}
