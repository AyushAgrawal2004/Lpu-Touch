pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Deploy') {
            steps {
                sh 'docker compose down --remove-orphans || true'
                sh 'docker compose up --build -d'
            }
        }

    }

    post {
        success {
            echo '✅ App is running at http://localhost'
        }
        failure {
            echo '❌ Build failed. Run: docker compose logs'
        }
    }
}
