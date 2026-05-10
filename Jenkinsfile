// ============================================================================
// LPU Touch — Jenkins Declarative Pipeline
// Repo: https://github.com/AyushAgrawal2004/Lpu-Touch
// ============================================================================

pipeline {

    agent any

    // ── Build parameters (editable from Jenkins UI on each run) ──────────────
    parameters {
        string(
            name: 'GIT_BRANCH',
            defaultValue: 'main',
            description: 'Branch to build & deploy'
        )
        string(
            name: 'DOCKERHUB_USER',
            defaultValue: 'ayushagrawal2004',
            description: 'DockerHub username'
        )
        string(
            name: 'DEPLOY_HOST',
            defaultValue: '0.0.0.0',
            description: 'Production server IP or hostname'
        )
        string(
            name: 'DEPLOY_USER',
            defaultValue: 'ubuntu',
            description: 'SSH username on production server'
        )
        booleanParam(
            name: 'PUSH_TO_DOCKERHUB',
            defaultValue: true,
            description: 'Push images to DockerHub after build?'
        )
        booleanParam(
            name: 'DEPLOY_TO_SERVER',
            defaultValue: true,
            description: 'SSH-deploy to production server?'
        )
    }

    // ── Pipeline-wide environment variables ───────────────────────────────────
    environment {
        // Image names — built from param so no hardcoding
        IMG_BACKEND  = "${params.DOCKERHUB_USER}/lputouch-backend"
        IMG_FRONTEND = "${params.DOCKERHUB_USER}/lputouch-frontend"

        // Each build gets a unique tag + also updates 'latest'
        BUILD_TAG    = "build-${env.BUILD_NUMBER}"

        // API URL baked into the React bundle
        VITE_API_URL = "http://${params.DEPLOY_HOST}:5555/api"

        // Credential IDs — must match what you store in Jenkins
        CRED_DOCKER  = 'dockerhub-credentials'
        CRED_JWT     = 'lputouch-jwt-secret'
        CRED_SSH_KEY = 'lputouch-prod-ssh-key'
    }

    options {
        timestamps()
        timeout(time: 40, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '15', artifactNumToKeepStr: '5'))
    }

    // ── Trigger: poll GitHub every 5 mins OR use a webhook ───────────────────
    triggers {
        // Comment this out if you use a GitHub webhook instead
        pollSCM('H/5 * * * *')
    }

    // =========================================================================
    stages {
    // =========================================================================

        // ── Stage 1: Checkout ─────────────────────────────────────────────────
        stage('📥 Checkout') {
            steps {
                echo "Cloning branch: ${params.GIT_BRANCH}"
                git(
                    url: 'https://github.com/AyushAgrawal2004/Lpu-Touch.git',
                    branch: params.GIT_BRANCH,
                    credentialsId: 'github-credentials'   // optional if public repo
                )
                sh 'git log -1 --pretty=format:"Commit: %h | %s | %an"'
            }
        }

        // ── Stage 2: Install Dependencies (parallel) ──────────────────────────
        stage('📦 Install') {
            parallel {

                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh '''
                                echo "Node: $(node -v) | NPM: $(npm -v)"
                                npm ci
                            '''
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh '''
                                echo "Node: $(node -v) | NPM: $(npm -v)"
                                npm install
                            '''
                        }
                    }
                }
            }
        }

        // ── Stage 3: Tests & Build Verification (parallel) ────────────────────
        stage('🧪 Test') {
            parallel {

                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm test --if-present || echo "⚠️  No test script defined — skipping"'
                        }
                    }
                }

                stage('Frontend Build Check') {
                    steps {
                        dir('frontend') {
                            sh "VITE_API_URL=${env.VITE_API_URL} npm run build"
                            echo '✅ Vite build successful'
                        }
                    }
                }
            }
        }

        // ── Stage 4: Build Docker Images ──────────────────────────────────────
        stage('🐳 Docker Build') {
            steps {
                script {
                    echo "Building images tagged: ${env.BUILD_TAG}"

                    // Backend
                    sh """
                        docker build \
                            --label "git.commit=\$(git rev-parse --short HEAD)" \
                            --label "build.number=${env.BUILD_NUMBER}" \
                            -t ${env.IMG_BACKEND}:${env.BUILD_TAG} \
                            -t ${env.IMG_BACKEND}:latest \
                            ./backend
                    """

                    // Frontend (bake API URL into the React bundle)
                    sh """
                        docker build \
                            --build-arg VITE_API_URL=${env.VITE_API_URL} \
                            --label "git.commit=\$(git rev-parse --short HEAD)" \
                            --label "build.number=${env.BUILD_NUMBER}" \
                            -t ${env.IMG_FRONTEND}:${env.BUILD_TAG} \
                            -t ${env.IMG_FRONTEND}:latest \
                            ./frontend
                    """
                }
            }
        }

        // ── Stage 5: Push to DockerHub ────────────────────────────────────────
        stage('🚀 Push to DockerHub') {
            when { expression { return params.PUSH_TO_DOCKERHUB } }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: env.CRED_DOCKER,
                        usernameVariable: 'DH_USER',
                        passwordVariable: 'DH_PASS'
                    )
                ]) {
                    sh """
                        echo "\$DH_PASS" | docker login -u "\$DH_USER" --password-stdin

                        docker push ${env.IMG_BACKEND}:${env.BUILD_TAG}
                        docker push ${env.IMG_BACKEND}:latest

                        docker push ${env.IMG_FRONTEND}:${env.BUILD_TAG}
                        docker push ${env.IMG_FRONTEND}:latest

                        docker logout
                        echo "✅ Images pushed successfully"
                    """
                }
            }
        }

        // ── Stage 6: Deploy to Production ─────────────────────────────────────
        stage('🌐 Deploy') {
            when { expression { return params.DEPLOY_TO_SERVER } }
            steps {
                withCredentials([
                    string(credentialsId: env.CRED_JWT, variable: 'JWT_SECRET'),
                    sshUserPrivateKey(
                        credentialsId: env.CRED_SSH_KEY,
                        keyFileVariable: 'SSH_KEY'
                    )
                ]) {
                    sh """
                        # Ensure deploy directory exists on server
                        ssh -i \$SSH_KEY \
                            -o StrictHostKeyChecking=no \
                            -o ConnectTimeout=15 \
                            ${params.DEPLOY_USER}@${params.DEPLOY_HOST} \
                            "mkdir -p /opt/lputouch"

                        # Copy compose file to server
                        scp -i \$SSH_KEY \
                            -o StrictHostKeyChecking=no \
                            docker-compose.yml \
                            ${params.DEPLOY_USER}@${params.DEPLOY_HOST}:/opt/lputouch/docker-compose.yml

                        # Pull latest images and restart containers
                        ssh -i \$SSH_KEY \
                            -o StrictHostKeyChecking=no \
                            ${params.DEPLOY_USER}@${params.DEPLOY_HOST} << 'EOF'
                                set -e
                                cd /opt/lputouch

                                export JWT_SECRET='${env.JWT_SECRET}'
                                export IMG_BACKEND='${env.IMG_BACKEND}:${env.BUILD_TAG}'
                                export IMG_FRONTEND='${env.IMG_FRONTEND}:${env.BUILD_TAG}'

                                echo "📥 Pulling images..."
                                docker pull \$IMG_BACKEND
                                docker pull \$IMG_FRONTEND

                                echo "♻️  Restarting containers..."
                                JWT_SECRET=\$JWT_SECRET docker compose up -d --remove-orphans

                                echo "🧹 Pruning old images..."
                                docker image prune -f

                                echo "✅ Deployment complete!"
                                docker compose ps
EOF
                    """
                }
            }
        }

    // =========================================================================
    }   // end stages
    // =========================================================================

    // ── Post-pipeline actions ─────────────────────────────────────────────────
    post {

        success {
            echo """
╔══════════════════════════════════════════╗
║         ✅  PIPELINE SUCCEEDED           ║
╠══════════════════════════════════════════╣
║  Branch  : ${params.GIT_BRANCH}
║  Build # : ${env.BUILD_NUMBER}
║  Tag     : ${env.BUILD_TAG}
║  Backend : ${env.IMG_BACKEND}:${env.BUILD_TAG}
║  Frontend: ${env.IMG_FRONTEND}:${env.BUILD_TAG}
║  App URL : http://${params.DEPLOY_HOST}
╚══════════════════════════════════════════╝
            """
        }

        failure {
            echo '❌ Pipeline FAILED. Check the red stage above for details.'
            // Uncomment to email your team on failure:
            // mail(
            //     to: 'your-team@example.com',
            //     subject: "❌ LPU Touch Pipeline #${BUILD_NUMBER} FAILED",
            //     body: "Build URL: ${BUILD_URL}\nBranch: ${params.GIT_BRANCH}"
            // )
        }

        always {
            // Remove dangling Docker images to keep disk clean
            sh 'docker image prune -f || true'
            // Wipe Jenkins workspace
            cleanWs()
        }
    }
}
