pipeline {
    agent any
    
    environment {
        // Docker Hub credentials (configure in Jenkins: Manage Jenkins > Credentials)
        DOCKER_HUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_HUB_USERNAME = 'thisarasamuditha'
        
        // Docker image names
        BACKEND_IMAGE = "${DOCKER_HUB_USERNAME}/task_tracker_backend"
        FRONTEND_IMAGE = "${DOCKER_HUB_USERNAME}/task_tracker_frontend"
        
        // Build version/tag
        BUILD_TAG = "${env.BUILD_NUMBER}"
        
        // Git repository info
        GIT_COMMIT_SHORT = sh(
            script: "git rev-parse --short HEAD",
            returnStdout: true
        ).trim()
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "========== Checking out code from GitHub =========="
                    checkout scm
                    echo "Git Commit: ${GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                script {
                    echo "========== Setting up build environment =========="
                    sh '''
                        echo "Node version:"
                        node --version
                        echo "NPM version:"
                        npm --version
                        echo "Java version:"
                        java -version
                        echo "Maven version:"
                        mvn -version
                        echo "Docker version:"
                        docker --version
                    '''
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                script {
                    echo "========== Building Spring Boot Backend =========="
                    dir('backend') {
                        sh '''
                            echo "Cleaning and building backend..."
                            mvn clean package -DskipTests
                            echo "Backend build completed successfully!"
                        '''
                    }
                }
            }
        }
        
        stage('Test Backend') {
            steps {
                script {
                    echo "========== Running Backend Tests =========="
                    dir('backend') {
                        sh '''
                            echo "Running unit tests..."
                            mvn test
                        '''
                    }
                }
            }
            post {
                always {
                    // Publish test results
                    junit '**/target/surefire-reports/*.xml'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                script {
                    echo "========== Building React Frontend =========="
                    dir('frontend') {
                        sh '''
                            echo "Installing dependencies..."
                            npm install --legacy-peer-deps
                            
                            echo "Building frontend..."
                            npm run build
                            
                            echo "Frontend build completed successfully!"
                        '''
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Docker Image') {
                    steps {
                        script {
                            echo "========== Building Backend Docker Image =========="
                            dir('backend') {
                                sh """
                                    docker build -t ${BACKEND_IMAGE}:${BUILD_TAG} \
                                                 -t ${BACKEND_IMAGE}:latest \
                                                 -t ${BACKEND_IMAGE}:${GIT_COMMIT_SHORT} .
                                """
                            }
                        }
                    }
                }
                
                stage('Build Frontend Docker Image') {
                    steps {
                        script {
                            echo "========== Building Frontend Docker Image =========="
                            dir('frontend') {
                                sh """
                                    docker build -t ${FRONTEND_IMAGE}:${BUILD_TAG} \
                                                 -t ${FRONTEND_IMAGE}:latest \
                                                 -t ${FRONTEND_IMAGE}:${GIT_COMMIT_SHORT} \
                                                 --build-arg VITE_API_BASE_URL=/api .
                                """
                            }
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    echo "========== Running Security Scans =========="
                    sh '''
                        echo "Scanning Docker images for vulnerabilities..."
                        
                        # Using Trivy for vulnerability scanning (if installed)
                        if command -v trivy &> /dev/null; then
                            echo "Running Trivy scan on backend image..."
                            trivy image --severity HIGH,CRITICAL ${BACKEND_IMAGE}:${BUILD_TAG} || true
                            
                            echo "Running Trivy scan on frontend image..."
                            trivy image --severity HIGH,CRITICAL ${FRONTEND_IMAGE}:${BUILD_TAG} || true
                        else
                            echo "Trivy not installed. Skipping security scan."
                            echo "Install Trivy: https://aquasecurity.github.io/trivy/"
                        fi
                    '''
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    echo "========== Pushing Images to Docker Hub =========="
                    sh '''
                        echo "Logging into Docker Hub..."
                        echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin
                        
                        echo "Pushing backend images..."
                        docker push ${BACKEND_IMAGE}:${BUILD_TAG}
                        docker push ${BACKEND_IMAGE}:latest
                        docker push ${BACKEND_IMAGE}:${GIT_COMMIT_SHORT}
                        
                        echo "Pushing frontend images..."
                        docker push ${FRONTEND_IMAGE}:${BUILD_TAG}
                        docker push ${FRONTEND_IMAGE}:latest
                        docker push ${FRONTEND_IMAGE}:${GIT_COMMIT_SHORT}
                        
                        echo "All images pushed successfully!"
                    '''
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo "========== Deploying Application =========="
                    sh '''
                        echo "Stopping existing containers..."
                        docker-compose down || true
                        
                        echo "Starting application with docker-compose..."
                        docker-compose up -d
                        
                        echo "Waiting for services to be healthy..."
                        sleep 30
                        
                        echo "Checking container status..."
                        docker-compose ps
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "========== Running Health Checks =========="
                    sh '''
                        echo "Checking backend health..."
                        max_attempts=30
                        attempt=0
                        
                        while [ $attempt -lt $max_attempts ]; do
                            if curl -f http://localhost:8000/actuator/health 2>/dev/null || curl -f http://localhost:8000 2>/dev/null; then
                                echo "Backend is healthy!"
                                break
                            fi
                            attempt=$((attempt + 1))
                            echo "Attempt $attempt/$max_attempts: Backend not ready yet..."
                            sleep 5
                        done
                        
                        if [ $attempt -eq $max_attempts ]; then
                            echo "WARNING: Backend health check timed out"
                        fi
                        
                        echo "Checking frontend health..."
                        if curl -f http://localhost:9000 2>/dev/null; then
                            echo "Frontend is healthy!"
                        else
                            echo "WARNING: Frontend health check failed"
                        fi
                        
                        echo "Application is running!"
                        echo "Frontend URL: http://localhost:9000"
                        echo "Backend URL: http://localhost:8000"
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo "=========================================="
            echo "Pipeline executed successfully! ✅"
            echo "=========================================="
            echo "Docker Images:"
            echo "  - ${BACKEND_IMAGE}:${BUILD_TAG}"
            echo "  - ${FRONTEND_IMAGE}:${BUILD_TAG}"
            echo "=========================================="
            echo "Application URLs:"
            echo "  - Frontend: http://localhost:9000"
            echo "  - Backend: http://localhost:8000"
            echo "=========================================="
            
            // Clean up old Docker images (keep last 5 builds)
            sh '''
                echo "Cleaning up old Docker images..."
                docker images ${BACKEND_IMAGE} --format "{{.Tag}}" | grep -E "^[0-9]+$" | sort -rn | tail -n +6 | xargs -I {} docker rmi ${BACKEND_IMAGE}:{} || true
                docker images ${FRONTEND_IMAGE} --format "{{.Tag}}" | grep -E "^[0-9]+$" | sort -rn | tail -n +6 | xargs -I {} docker rmi ${FRONTEND_IMAGE}:{} || true
            '''
        }
        
        failure {
            echo "=========================================="
            echo "Pipeline failed! ❌"
            echo "=========================================="
            echo "Check the logs above for error details"
            echo "=========================================="
        }
        
        always {
            // Logout from Docker Hub
            sh 'docker logout || true'
            
            // Archive build artifacts
            archiveArtifacts artifacts: '**/target/*.jar', allowEmptyArchive: true
            archiveArtifacts artifacts: '**/dist/**', allowEmptyArchive: true
            
            // Clean workspace if needed
            cleanWs(
                cleanWhenFailure: false,
                cleanWhenNotBuilt: false,
                deleteDirs: true,
                disableDeferredWipeout: true
            )
        }
    }
}
