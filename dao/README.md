
![Image description](https://github.com/SingularDTV/snglsDAO-whitepaper/blob/master/images/logo.png?raw=true)
# snglsDao

## Pre Requirements 

Use Node.js [8.10.0](https://itnext.io/nvm-the-easiest-way-to-switch-node-js-environments-on-your-machine-in-a-flash-17babb7d5f1b)
```sh
nvm use 10.5.0
```

Alse you need [python 2.7](https://www.python.org/downloads/) intalled to prevent `scrypt` dependency compilation error

## Install
```sh
npm install
```

## Deploy DAO
```sh
npm run start
```

## Trouble shootings

Access errors on `npm install`

sudo chown -R $(whoami) ~/.npm

npm cache clean / npm cache verify