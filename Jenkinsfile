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
        stage ('Deploy') {
            steps {
                    echo 'Deploying...'
                    sh 'ls'
                    sh 'exit'
                    sh 'docker ps -a -q'
                    sh 'cd ..'
                    sh 'cd ..'
                    sh 'pwd'
                    sh('deploy.sh')
                    sh 'pwd'
                    sh 'ls'
                }
        }
    }
}