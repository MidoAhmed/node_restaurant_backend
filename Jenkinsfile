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
            agent any
            steps {
                    echo 'Deploying...'
                    sh 'cd ..'
                    sh 'cd ..'
                    sh 'pwd'
                    sh 'ls'
                    sh('deploy.sh')
                    sh 'ls'
                }
        }
    }
}