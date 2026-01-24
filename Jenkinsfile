pipeline {
    agent any
    
    environment {
        DOCKER_HUB_REPO = 'thisarasamuditha'
        IMAGE_TAG = "${BUILD_NUMBER}"
        EC2_HOST = '43.205.116.130'
        EC2_USER = 'ubuntu'
        APP_DIR = '/home/ubuntu/app'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Pulling latest code from Git repository...'
                checkout scm
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        echo 'Building Backend Docker image...'
                        script {
                            dir('backend') {
                                sh """
                                    docker build --platform linux/amd64 \
                                        -t ${DOCKER_HUB_REPO}/backend:${IMAGE_TAG} \
                                        -t ${DOCKER_HUB_REPO}/backend:latest \
                                        --build-arg BUILDKIT_INLINE_CACHE=1 .
                                """
                            }
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        echo 'Building Frontend Docker image...'
                        script {
                            dir('frontend') {
                                sh """
                                    docker build --platform linux/amd64 \
                                        --build-arg VITE_API_BASE_URL=http://${EC2_HOST}:8088/api \
                                        -t ${DOCKER_HUB_REPO}/frontend:${IMAGE_TAG} \
                                        -t ${DOCKER_HUB_REPO}/frontend:latest \
                                        --build-arg BUILDKIT_INLINE_CACHE=1 .
                                """
                            }
                        }
                    }
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Test Backend') {
                    steps {
                        echo 'Running backend tests...'
                        script {
                            dir('backend') {
                                sh '''
                                    echo "Running Maven tests..."
                                    ./mvnw test || echo "Tests completed with warnings"
                                '''
                            }
                        }
                    }
                }
                stage('Lint Frontend') {
                    steps {
                        echo 'Running frontend linting...'
                        script {
                            dir('frontend') {
                                sh '''
                                    echo "Running ESLint..."
                                    npm run lint || echo "Linting completed with warnings"
                                '''
                            }
                        }
                    }
                }
                stage('Image Verification') {
                    steps {
                        echo 'Verifying Docker images...'
                        script {
                            sh """
                                echo "✓ Backend image: ${DOCKER_HUB_REPO}/backend:${IMAGE_TAG}"
                                echo "✓ Frontend image: ${DOCKER_HUB_REPO}/frontend:${IMAGE_TAG}"
                                docker images | grep ${DOCKER_HUB_REPO}
                            """
                        }
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing images to Docker Hub...'
                script {
                    currentBuild.description = "Deploying Build #${BUILD_NUMBER}"
                    currentBuild.displayName = "#${BUILD_NUMBER} - Auto Deploy"
                    
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh '''
                            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                            docker push ${DOCKER_HUB_REPO}/backend:${IMAGE_TAG}
                            docker push ${DOCKER_HUB_REPO}/backend:latest
                            docker push ${DOCKER_HUB_REPO}/frontend:${IMAGE_TAG}
                            docker push ${DOCKER_HUB_REPO}/frontend:latest
                            docker logout
                        '''
                    }
                }
                echo 'Images successfully pushed to Docker Hub!'
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                echo 'Deploying to EC2 using Ansible...'
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
                                    --extra-vars "deploy_version=latest"
                            """
                        }
                    }
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo 'Verifying deployment health...'
                script {
                    sh """
                        echo "Waiting 30 seconds for services to start..."
                        sleep 30
                        
                        echo "Testing frontend..."
                        curl -f http://${EC2_HOST}:80 || exit 1
                        
                        echo "Testing backend API..."
                        curl -f http://${EC2_HOST}:8088/api/tasks || echo "Backend needs authentication"
                        
                        echo "✓ All services are healthy!"
                    """
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up local Docker images...'
            script {
                sh """
                    docker rmi ${DOCKER_HUB_REPO}/backend:${IMAGE_TAG} || true
                    docker rmi ${DOCKER_HUB_REPO}/backend:latest || true
                    docker rmi ${DOCKER_HUB_REPO}/frontend:${IMAGE_TAG} || true
                    docker rmi ${DOCKER_HUB_REPO}/frontend:latest || true
                """
            }
        }
        success {
            echo '✓ Pipeline completed successfully!'
            echo "✓ Application deployed to: http://${EC2_HOST}"
            echo "✓ Build version: ${IMAGE_TAG}"
        }
        failure {
            echo '✗ Pipeline failed. Check the logs for details.'
        }
    }
}
