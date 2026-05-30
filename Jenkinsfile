pipeline {

    agent any

    environment {
        DOCKER      = '/usr/local/bin/docker'
        DOCKER_HOST = 'unix:///var/run/docker.sock'
        PATH        = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
    }

    stages {

        stage('Build & Deploy') {
            steps {
                dir('/Users/ayushagrawal/Desktop/lpuTouch') {
                    sh '${DOCKER} compose down --remove-orphans || true'
                    sh '${DOCKER} compose up --build -d'
                }
            }
        }

    }

    post {
        success {
            echo '✅ App is running at http://localhost'
        }
        failure {
            echo '❌ Build failed. Check logs with: docker compose logs'
        }
    }
}
