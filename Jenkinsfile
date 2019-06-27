#!/usr/bin/env groovy

pipeline {

    agent {
        docker {
            image 'node'
            args '-u root --link ceb9894bd77c:TempContainer'
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
        stage ('Deploy') {
            agent {
            label 'linux'
            }
            steps {
                    echo 'Deploying...'
                    sh('./script/deploy.sh')
                }
        }
    }
}