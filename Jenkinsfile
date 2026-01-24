pipeline {
    agent any
    
    environment {
        DOCKER_USERNAME = 'thisarasamuditha'  // Your DockerHub username
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        
        FRONTEND_IMAGE = "${DOCKER_USERNAME}/frontend"
        BACKEND_IMAGE = "${DOCKER_USERNAME}/backend"
        
        BUILD_TAG = "${env.BUILD_NUMBER}"
    }
    
    triggers {
        githubPush()
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out source code from GitHub'
                checkout scm
            }
        }
        
        stage('Build Backend Image') {
            steps {
                echo '🏗️  Building Backend Docker image'
                script {
                    dir('backend') {
                        sh """
                            docker build -t ${BACKEND_IMAGE}:latest .
                            docker tag ${BACKEND_IMAGE}:latest ${BACKEND_IMAGE}:${BUILD_TAG}
                        """
                    }
                }
            }
        }
        
        stage('Build Frontend Image') {
            steps {
                echo '🏗️  Building Frontend Docker image'
                script {
                    dir('frontend') {
                        sh """
                            docker build -t ${FRONTEND_IMAGE}:latest \
                              --build-arg VITE_API_BASE_URL=http://43.205.116.130:8088/api .
                            docker tag ${FRONTEND_IMAGE}:latest ${FRONTEND_IMAGE}:${BUILD_TAG}
                        """
                    }
                }
            }
        }
        
        stage('Login to DockerHub') {
            steps {
                echo '🔐 Logging into DockerHub'
                sh """
                    echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin
                """
            }
        }
        
        stage('Push Images') {
            steps {
                echo '📤 Pushing images to DockerHub'
                sh """
                    docker push ${BACKEND_IMAGE}:latest
                    docker push ${BACKEND_IMAGE}:${BUILD_TAG}
                    docker push ${FRONTEND_IMAGE}:latest
                    docker push ${FRONTEND_IMAGE}:${BUILD_TAG}
                """
            }
        }
        
        stage('Deploy with Docker Compose') {
            steps {
                echo '🚀 Deploying application with docker-compose'
                script {
                    sh """
                        # Jenkins workspace already contains the code
                        echo "Current directory: \$(pwd)"
                        echo "Checking docker-compose.yml..."
                        ls -la docker-compose.yml
                        
                        # Pull latest images from DockerHub
                        docker compose pull
                        
                        # Stop and remove old containers
                        docker compose down || true
                        
                        # Start new containers
                        docker compose up -d
                        
                        # Wait for containers to initialize
                        sleep 10
                        
                        # Verify all containers are running
                        docker compose ps
                        
                        # Check MySQL is ready
                        docker logs mysql_db 2>&1 | grep -i "ready for connections" || echo "MySQL still initializing..."
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo '🌐 Frontend: http://43.205.116.130'
            echo '🔧 Backend: http://43.205.116.130:8088/api'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
        cleanup {
            script {
                // Cleanup runs in agent context
                try {
                    sh 'docker logout || true'
                    sh 'docker image prune -f || true'
                } catch (Exception e) {
                    echo "Cleanup failed: ${e.message}"
                }
            }
        }
    }
}