pipeline {
    agent any
    
    environment {
        // DockerHub configuration
        DOCKER_USERNAME = 'YOUR_DOCKERHUB_USERNAME'
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        
        // Image names
        FRONTEND_IMAGE = "${DOCKER_USERNAME}/frontend"
        BACKEND_IMAGE = "${DOCKER_USERNAME}/backend"
        
        // Build tag
        BUILD_TAG = "${env.BUILD_NUMBER}"
        
        // EC2 configuration
        EC2_IP = credentials('ec2-ip')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code from GitHub...'
                checkout scm
            }
        }
        
        stage('Build Backend Image') {
            steps {
                echo '🏗️  Building Spring Boot backend Docker image...'
                dir('backend') {
                    script {
                        sh """
                            docker build -t ${BACKEND_IMAGE}:${BUILD_TAG} .
                            docker tag ${BACKEND_IMAGE}:${BUILD_TAG} ${BACKEND_IMAGE}:latest
                        """
                    }
                }
            }
        }
        
        stage('Build Frontend Image') {
            steps {
                echo '🏗️  Building React frontend Docker image...'
                dir('frontend') {
                    script {
                        sh """
                            docker build -t ${FRONTEND_IMAGE}:${BUILD_TAG} \
                              --build-arg VITE_API_BASE_URL=http://${EC2_IP}:8080/api .
                            docker tag ${FRONTEND_IMAGE}:${BUILD_TAG} ${FRONTEND_IMAGE}:latest
                        """
                    }
                }
            }
        }
        
        stage('Push Images to DockerHub') {
            steps {
                echo '📤 Pushing Docker images to DockerHub...'
                script {
                    sh """
                        echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin
                        docker push ${BACKEND_IMAGE}:${BUILD_TAG}
                        docker push ${BACKEND_IMAGE}:latest
                        docker push ${FRONTEND_IMAGE}:${BUILD_TAG}
                        docker push ${FRONTEND_IMAGE}:latest
                        docker logout
                    """
                }
            }
        }
        
        stage('Update docker-compose.yml') {
            steps {
                echo '📝 Updating docker-compose.yml with DockerHub username...'
                script {
                    sh """
                        sed -i 's|YOUR_DOCKERHUB_USERNAME|${DOCKER_USERNAME}|g' docker-compose.yml
                    """
                }
            }
        }
        
        stage('Deploy to EC2 with Ansible') {
            steps {
                echo '🚀 Deploying application to EC2 using Ansible...'
                dir('ansible') {
                    script {
                        // Update inventory with current EC2 IP
                        sh """
                            sed -i 's|<EC2_PUBLIC_IP>|${EC2_IP}|g' inventory.ini
                        """
                        
                        // Run Ansible playbook
                        withCredentials([
                            usernamePassword(credentialsId: 'dockerhub-credentials', 
                                           usernameVariable: 'DOCKER_USERNAME', 
                                           passwordVariable: 'DOCKER_PASSWORD')
                        ]) {
                            sh """
                                export DOCKER_USERNAME=${DOCKER_USERNAME}
                                export DOCKER_PASSWORD=${DOCKER_PASSWORD}
                                ansible-playbook -i inventory.ini deploy.yml
                            """
                        }
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo "🌐 Frontend URL: http://${EC2_IP}"
            echo "🔧 Backend API: http://${EC2_IP}:8080"
        }
        failure {
            echo '❌ Pipeline failed! Check logs for details.'
        }
        always {
            echo '🧹 Cleaning up local Docker images...'
            sh """
                docker rmi ${BACKEND_IMAGE}:${BUILD_TAG} || true
                docker rmi ${FRONTEND_IMAGE}:${BUILD_TAG} || true
            """
        }
    }
}
