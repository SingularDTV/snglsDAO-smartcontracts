pipeline {
  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '5', numToKeepStr: '5'))
  }
  agent {
    node {
      label 'ubuntu-18.04'
    }
  }
  stages {
    stage('INIT') {
      steps {
        nodejs('nodejs-10') {
          sh 'cd dao-web-app/ && npm install'
        }
      }
    }
    stage('BUILD') {
      steps {
        nodejs('nodejs-10') {
          sh 'cd dao-web-app/ && npm run build-dev'
        }
      }
    }
    stage('webpack rinkeby develop branch') {
      when {
        branch 'develop'
      }
      steps {
        nodejs('nodejs-10') {
          sh 'cd dao-web-app/ && npm run build-rinkeby'
          archiveArtifacts(artifacts: 'dao-web-app/dist/', onlyIfSuccessful: true)
        }
      }
    }
    stage('webpack main master branch') {
      when {
        branch 'master'
      }
      steps {
        sh 'cd dao-web-app/ && npm run build'
        archiveArtifacts(artifacts: 'dao-web-app/dist/', onlyIfSuccessful: true)
      }
    }
  }
}
