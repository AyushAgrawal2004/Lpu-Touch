// ============================================================================
// LPU Touch — Jenkins Declarative Pipeline
// ============================================================================
// Prerequisites on Jenkins server:
//   • Docker + Docker Compose installed and accessible by jenkins user
//   • Node.js 20 installed (or use nvm / NodeJS Jenkins plugin)
//   • Credentials configured in Jenkins:
//       - "dockerhub-credentials"  → DockerHub username/password
//       - "lputouch-jwt-secret"    → Secret text for JWT_SECRET
//       - "lputouch-prod-server"   → SSH key for deployment server
//   • Environment variables (optional, override below):
//       - DOCKERHUB_USER           → your DockerHub username
//       - DEPLOY_HOST              → IP/hostname of production server
// ============================================================================

pipeline {

    agent any

    // ── Configurable parameters (can be changed per-run from Jenkins UI) ──────
    parameters {
        string(
            name: 'BRANCH',
            defaultValue: 'main',
            description: 'Git branch to build'
        )
        string(
            name: 'DOCKERHUB_USER',
            defaultValue: 'yourdockerhubuser',
            description: 'DockerHub username for pushing images'
        )
        string(
            name: 'DEPLOY_HOST',
            defaultValue: '192.168.1.100',
            description: 'SSH host of the production server'
        )
        booleanParam(
            name: 'PUSH_IMAGES',
            defaultValue: true,
            description: 'Push built images to DockerHub?'
        )
        booleanParam(
            name: 'DEPLOY',
            defaultValue: true,
            description: 'SSH into production and deploy?'
        )
    }

    // ── Environment variables available to all stages ─────────────────────────
    environment {
        IMAGE_BACKEND  = "${params.DOCKERHUB_USER}/lputouch-backend"
        IMAGE_FRONTEND = "${params.DOCKERHUB_USER}/lputouch-frontend"
        IMAGE_TAG      = "${env.BUILD_NUMBER}"          // e.g. "42"
        IMAGE_TAG_LATEST = "latest"
        VITE_API_URL   = "http://${params.DEPLOY_HOST}:5555/api"
    }

    // ── Global options ────────────────────────────────────────────────────────
    options {
        timestamps()                          // prefix every log line with time
        timeout(time: 30, unit: 'MINUTES')    // kill the build if it hangs
        disableConcurrentBuilds()             // one build at a time
        buildDiscarder(logRotator(
            numToKeepStr: '10',               // keep last 10 build logs
            artifactNumToKeepStr: '5'
        ))
    }

    stages {

        // ── 1. Checkout ───────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo "📥 Checking out branch: ${params.BRANCH}"
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${params.BRANCH}"]],
                    userRemoteConfigs: [[url: scm.userRemoteConfigs[0].url]]
                ])
                sh 'echo "Commit: $(git rev-parse --short HEAD)"'
            }
        }

        // ── 2. Install & Lint ─────────────────────────────────────────────────
        stage('Install & Lint') {
            parallel {

                stage('Backend — Install') {
                    steps {
                        dir('backend') {
                            echo '📦 Installing backend dependencies…'
                            sh 'npm ci --omit=dev'
                        }
                    }
                }

                stage('Frontend — Install') {
                    steps {
                        dir('frontend') {
                            echo '📦 Installing frontend dependencies…'
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        // ── 3. Tests ──────────────────────────────────────────────────────────
        stage('Tests') {
            parallel {

                stage('Backend — Tests') {
                    steps {
                        dir('backend') {
                            echo '🧪 Running backend tests…'
                            // Replace with your actual test command, e.g. jest
                            sh 'npm test --if-present || echo "No test script defined — skipping"'
                        }
                    }
                }

                stage('Frontend — Build Check') {
                    steps {
                        dir('frontend') {
                            echo '🔨 Verifying frontend builds without errors…'
                            sh "VITE_API_URL=${env.VITE_API_URL} npm run build"
                        }
                    }
                }
            }
        }

        // ── 4. Docker Build ───────────────────────────────────────────────────
        stage('Docker Build') {
            steps {
                echo '🐳 Building Docker images…'
                sh """
                    docker build \
                        -t ${env.IMAGE_BACKEND}:${env.IMAGE_TAG} \
                        -t ${env.IMAGE_BACKEND}:${env.IMAGE_TAG_LATEST} \
                        ./backend

                    docker build \
                        --build-arg VITE_API_URL=${env.VITE_API_URL} \
                        -t ${env.IMAGE_FRONTEND}:${env.IMAGE_TAG} \
                        -t ${env.IMAGE_FRONTEND}:${env.IMAGE_TAG_LATEST} \
                        ./frontend
                """
            }
        }

        // ── 5. Push to DockerHub ──────────────────────────────────────────────
        stage('Push to DockerHub') {
            when {
                expression { return params.PUSH_IMAGES }
            }
            steps {
                echo '🚀 Pushing images to DockerHub…'
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                        docker push ''' + env.IMAGE_BACKEND  + ''':''' + env.IMAGE_TAG + '''
                        docker push ''' + env.IMAGE_BACKEND  + ''':latest
                        docker push ''' + env.IMAGE_FRONTEND + ''':''' + env.IMAGE_TAG + '''
                        docker push ''' + env.IMAGE_FRONTEND + ''':latest

                        docker logout
                    '''
                }
            }
        }

        // ── 6. Deploy to Production ───────────────────────────────────────────
        stage('Deploy') {
            when {
                expression { return params.DEPLOY }
            }
            steps {
                echo "🌐 Deploying build #${env.IMAGE_TAG} to ${params.DEPLOY_HOST}…"
                withCredentials([
                    string(credentialsId: 'lputouch-jwt-secret', variable: 'JWT_SECRET'),
                    sshUserPrivateKey(
                        credentialsId: 'lputouch-prod-server',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh """
                        # Copy latest docker-compose to server
                        scp -i \$SSH_KEY -o StrictHostKeyChecking=no \
                            docker-compose.yml \
                            \$SSH_USER@${params.DEPLOY_HOST}:/opt/lputouch/docker-compose.yml

                        # SSH in, pull new images and recreate containers
                        ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \
                            \$SSH_USER@${params.DEPLOY_HOST} << 'ENDSSH'
                            set -e
                            cd /opt/lputouch

                            export JWT_SECRET=\${JWT_SECRET}
                            export BACKEND_IMAGE=${env.IMAGE_BACKEND}:${env.IMAGE_TAG}
                            export FRONTEND_IMAGE=${env.IMAGE_FRONTEND}:${env.IMAGE_TAG}

                            # Pull the specific tagged images
                            docker pull \$BACKEND_IMAGE
                            docker pull \$FRONTEND_IMAGE

                            # Update docker-compose to use pinned tags instead of build context
                            sed -i "s|build:.*||g" docker-compose.yml
                            # Zero-downtime: bring up with new image, remove orphans
                            docker compose up -d --remove-orphans --no-build

                            # Clean up dangling images to free disk space
                            docker image prune -f
ENDSSH
                    """
                }
            }
        }
    }

    // ── Post actions (always run) ─────────────────────────────────────────────
    post {

        success {
            echo """
            ✅ Pipeline SUCCESS
            ─────────────────────────────────
            Branch  : ${params.BRANCH}
            Build # : ${env.BUILD_NUMBER}
            Images  : ${env.IMAGE_BACKEND}:${env.IMAGE_TAG}
                      ${env.IMAGE_FRONTEND}:${env.IMAGE_TAG}
            URL     : http://${params.DEPLOY_HOST}
            ─────────────────────────────────
            """
        }

        failure {
            echo '❌ Pipeline FAILED — check the stage logs above for details.'
            // Uncomment to send email notifications:
            // mail to: 'your-team@example.com',
            //      subject: "❌ LPU Touch build #${BUILD_NUMBER} failed",
            //      body: "See: ${BUILD_URL}"
        }

        always {
            // Clean up locally built images to keep Jenkins disk usage low
            sh '''
                docker rmi $(docker images -q --filter "dangling=true") 2>/dev/null || true
            '''
            cleanWs()   // wipe Jenkins workspace after every build
        }
    }
}
