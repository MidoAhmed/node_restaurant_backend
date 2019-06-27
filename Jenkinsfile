#!/usr/bin/env groovy

pipeline {

    agent {
        docker {
            image 'node'
            args '-u root'
        }
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building...'
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing...'
                sh 'npm test'
            }
        }
        stage ('docker') {
         agent {
                dockerfile {
                  filename "back-end/dockerfiles/ci/Dockerfile"
                }
         }
        }
        stage ('Deploy') {
            steps {
                    echo 'Deploying...'
                    sh('./script/deploy.sh')
                }
        }
    }
}