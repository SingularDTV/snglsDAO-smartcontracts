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
//     stage('BUILD') {
//       steps {
//         nodejs('nodejs-10') {
//           sh 'cd dao-web-app/ && npm run build-dev'
//         }
//       }
//     }
    stage('develop(rinkeby) -> https://snglsdao.blaize.tech') {
      when {
        branch 'develop'
      }
      steps {
        nodejs('nodejs-10') {
          sh 'cd dao-web-app/ && npm run build-rinkeby'
        }
        sshagent(['snglsdao-www']) {
          sh 'rsync -a --verbose --delete -e "ssh -o StrictHostKeyChecking=no" dao-web-app/dist/ snglsdao-www@test.blaize.tech:/var/www/snglsdao.blaize.tech/'
        }
      }
    }
    stage('pre-production(main) -> https://stageapp.snglsdao.io/') {
      when {
        branch 'pre-production'
      }
      steps {
        nodejs('nodejs-10') {
          sh 'cd dao-web-app/ && npm run build'
          // we archive as we can actually use this for deploy on prod without the build of production branch
          archiveArtifacts(artifacts: 'dao-web-app/dist/', onlyIfSuccessful: true)
        }
        sshagent(['snglsdao-www']) {
          sh 'rsync -a --verbose --delete -e "ssh -o StrictHostKeyChecking=no" dao-web-app/dist/ snglsdao-www@stageapp.snglsdao.io:/var/www/stageapp.snglsdao.io/'
        }
      }
    }
    stage('production(main) -> https://app.snglsdao.io/') {
      when {
        branch 'production'
      }
      steps {
        nodejs('nodejs-10') {
          sh 'cd dao-web-app/ && npm run build'
          archiveArtifacts(artifacts: 'dao-web-app/dist/', onlyIfSuccessful: true)
          // the installation controlled by separate job in jenkins
          // https://jenkins.blaize.tech/view/snglsdao/job/prod-snglsdao-deploy-app.snglsdao.io/
        }
      }
    }
  }
}
