
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

Run truffle developer network

```sh
npm run network
```

Run migrations (in another tab)
```sh
npm run migrate
```

## Trouble shootings

### Access errors on `npm install`

```sh
sudo chown -R $(whoami) ~/.npm
```

```sh
npm cache clean # or 
npm cache verify # for npm@5 version and up
```

### Deploy errors

`✖ Transaction failed: Error: Returned error: VM Exception while processing transaction: revert` often occurs if the contract is already deployed on the network, do not forget to run 
```sh 
    npm run stop
``` 
before a new launch