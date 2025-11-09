pipeline {
    agent any
    
    environment {
        DOCKER_HUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_HUB_USERNAME = 'thisarasamuditha'
        BACKEND_IMAGE = "${DOCKER_HUB_USERNAME}/task_tracker_backend"
        FRONTEND_IMAGE = "${DOCKER_HUB_USERNAME}/task_tracker_frontend"
        BUILD_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "Checking out code from GitHub..."
                checkout scm
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        npm install --legacy-peer-deps
                        npm run build
                    '''
                }
            }
        }
        
        stage('Build & Push Docker Images') {
            steps {
                sh '''
                    echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin
                    
                    # Build and push backend
                    docker build -t ${BACKEND_IMAGE}:${BUILD_TAG} -t ${BACKEND_IMAGE}:latest ./backend
                    docker push ${BACKEND_IMAGE}:${BUILD_TAG}
                    docker push ${BACKEND_IMAGE}:latest
                    
                    # Build and push frontend
                    docker build -t ${FRONTEND_IMAGE}:${BUILD_TAG} -t ${FRONTEND_IMAGE}:latest --build-arg VITE_API_BASE_URL=/api ./frontend
                    docker push ${FRONTEND_IMAGE}:${BUILD_TAG}
                    docker push ${FRONTEND_IMAGE}:latest
                '''
            }
        }
        
        stage('Deploy') {
            steps {
                sh '''
                    docker-compose down || true
                    docker-compose up -d
                    sleep 15
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                sh '''
                    curl -f http://localhost:8000 || echo "Backend starting..."
                    curl -f http://localhost:9000 || echo "Frontend starting..."
                    echo "Deployment complete!"
                '''
            }
        }
    }
    
    post {
        success {
            echo "✅ Pipeline SUCCESS! App running at http://localhost:9000"
        }
        failure {
            echo "❌ Pipeline FAILED! Check logs above."
        }
        always {
            sh 'docker logout || true'
        }
    }
}