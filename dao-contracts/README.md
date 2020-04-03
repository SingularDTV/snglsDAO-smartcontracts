
![Image description](https://github.com/SingularDTV/snglsDAO-whitepaper/blob/master/images/logo.png?raw=true)
# snglsDao

## Pre Requirements 

Use Node.js [10.16.0](https://itnext.io/nvm-the-easiest-way-to-switch-node-js-environments-on-your-machine-in-a-flash-17babb7d5f1b)
```sh
nvm use 10.16.0
```

Alse you need [python 2.7](https://www.python.org/downloads/) intalled to prevent `scrypt` dependency compilation error

DAOstack Migration:
```
npm install --global @daostack/migration
```

## Download

```sh
git clone https://github.com/blaize-tech/snglsDAO-smartcontracts.git
```

## Install

```sh
cd snglsDAO-smartcontracts/dao-contracts
npm install
cd ../dao-web
npm install
```

## Run environment

Run the following command to spin up ganache (with the migrated contracts), the caching server and the alchemy server:

```sh
docker-compose up graph-node
```

Now, in a separate terminal run the following command to run web application:

```sh
npm run start
```
Access it on http://127.0.0.1:3000


## Deploy DAO

Run migrations (in another tab)
```sh
cd ../dao-contracts
daostack-migrate dao --params ./data/snglDAOspec.json
```

## Testing

```sh
npm run test
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

Ensure that you use correct Node.js version in each window

`✖ Transaction failed: Error: Returned error: VM Exception while processing transaction: revert` often occurs if the contract is already deployed on the network, do not forget to run 
```sh 
    npm run stop
``` 
before a new launch