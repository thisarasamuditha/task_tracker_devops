pipeline {
    agent any
    
    environment {
        DOCKER_USERNAME = 'thisarasamuditha'
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        
        FRONTEND_IMAGE = "${DOCKER_USERNAME}/frontend"
        BACKEND_IMAGE = "${DOCKER_USERNAME}/backend"
        
        BUILD_TAG = "${env.BUILD_NUMBER}"
        
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
                    dir('backend') {
                        sh """
                            docker build -t ${BACKEND_IMAGE}:latest .
                            docker tag ${BACKEND_IMAGE}:latest ${BACKEND_IMAGE}:${BUILD_TAG}
                        """
                    }
                    
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
                echo 'Step 4: Deploying to EC2 via SSH'
                script {
                    withCredentials([
                        sshUserPrivateKey(
                            credentialsId: 'ec2-ssh-key',
                            keyFileVariable: 'SSH_KEY_FILE',
                            usernameVariable: 'SSH_USER'
                        )
                    ]) {
                        sh """
                            chmod 600 \${SSH_KEY_FILE}
                            
                            echo "=== Deploying to EC2: ${EC2_HOST} ==="
                            
                            # Copy docker-compose to EC2
                            scp -o StrictHostKeyChecking=no -i \${SSH_KEY_FILE} \
                                docker-compose.yml ${EC2_USER}@${EC2_HOST}:/home/ubuntu/
                            
                            # SSH and deploy
                            ssh -o StrictHostKeyChecking=no -i \${SSH_KEY_FILE} ${EC2_USER}@${EC2_HOST} bash << 'ENDSSH'
                                cd /home/ubuntu
                                
                                echo "Stopping old containers..."
                                docker compose down || true
                                docker rm -f mysql_db backend frontend || true
                                
                                echo "Pulling latest images..."
                                docker pull ${BACKEND_IMAGE}:latest
                                docker pull ${FRONTEND_IMAGE}:latest
                                
                                echo "Starting new containers..."
                                docker compose up -d
                                
                                echo "Waiting for services to start..."
                                sleep 15
                                
                                echo "Running containers:"
                                docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'
ENDSSH
                            
                            echo "=== Deployment Complete ==="
                        """
                    }
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo 'Step 5: Verifying deployment'
                script {
                    sh """
                        echo "Waiting for services to stabilize..."
                        sleep 20
                        
                        echo "Testing Frontend..."
                        curl -f http://${EC2_HOST} -o /dev/null && echo "✓ Frontend: OK" || echo "✗ Frontend: FAIL"
                        
                        echo "Testing Backend..."
                        curl -f http://${EC2_HOST}:8088/api -o /dev/null && echo "✓ Backend: OK" || echo "✗ Backend: FAIL"
                    """
                    
                    withCredentials([
                        sshUserPrivateKey(
                            credentialsId: 'ec2-ssh-key',
                            keyFileVariable: 'SSH_KEY_FILE'
                        )
                    ]) {
                        sh """
                            chmod 600 \${SSH_KEY_FILE}
                            
                            echo "Final container status on EC2:"
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
            echo '======================================='
            echo '✓ Pipeline completed successfully!'
            echo '======================================='
            echo "Frontend:  http://${EC2_HOST}"
            echo "Backend:   http://${EC2_HOST}:8088/api"
            echo "Database:  mysql://${EC2_HOST}:3306/taskdb"
            echo '======================================='
        }
        failure {
            echo '======================================='
            echo '✗ Pipeline failed!'
            echo 'Check logs above for details.'
            echo '======================================='
        }
        cleanup {
            sh 'docker logout || true'
            sh 'docker image prune -f || true'
        }
    }
}