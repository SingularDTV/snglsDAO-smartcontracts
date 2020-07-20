![Image description](https://github.com/SingularDTV/snglsDAO-whitepaper/blob/master/images/logo.png?raw=true)

# snglsDao

## snglsDao contracts

### Pre Requirements

Use Node.js [10.16.0](https://itnext.io/nvm-the-easiest-way-to-switch-node-js-environments-on-your-machine-in-a-flash-17babb7d5f1b)

```sh
nvm use 10.16.0
```

Alse you need [python 2.7](https://www.python.org/downloads/) intalled to prevent `scrypt` dependency compilation error

DAOstack Migration:

```
npm install --global @daostack/migration
```

### Download

```sh
git clone https://github.com/blaize-tech/snglsDAO-smartcontracts.git
```

### Install

```sh
cd snglsDAO-smartcontracts/dao-contracts
npm install
cd ../dao-web-app
npm install
cd ../token/airdrop
npm install
cd ../contracts
npm install
```

### Run environment

Run the following command to spin up ganache (with the migrated contracts), the caching server and the alchemy server:

```sh
docker-compose up graph-node
```

Now, in a separate terminal run the following command to run web application:

```sh
npm run start-staging-rinkeby # rinkeby web version
npm run start-private # ganache (private net)web version
```

Access it on http://127.0.0.1:3000

### Deploy DAO

Run migrations (in another tab)

```sh
cd ../dao-contracts
nvm use 8.10.0
npm run start
```

### Testing

```sh
npm run test
```

### Trouble shootings

#### Access errors on `npm install`

```sh
sudo chown -R $(whoami) ~/.npm
```

```sh
npm cache clean # or
npm cache verify # for npm@5 version and up
```

#### Deploy errors

Ensure that you use correct Node.js version in each window

`✖ Transaction failed: Error: Returned error: VM Exception while processing transaction: revert` often occurs if the contract is already deployed on the network, do not forget to terminate docker-compose (in dao-web-app terminal window) and run

```sh
    docker-compose down
```

before a new launch.

## snglsDAO web-app

### Dependencies:
* [NVM](https://github.com/creationix/nvm#installation) can be helpful to manage different versions of node
* [NodeJS 9.4 or greater + NPM](https://github.com/creationix/nvm#usage)
* You will  need [alchemy-server](https://github.com/daostack/alchemy-server) running locally for the app to function

### Installation

```sh
sudo apt-get install -y libsecret-1-dev
git clone https://github.com/daostack/alchemy.git
cd alchemy
npm ci
```

## Run app locally

There are two ways to work with the snglsDAO.
There is `docker-compose` file for quick setup. Alternatively,
you can recreate the docker environment by installing an starting all [services locally](./docs/nodocker.md).

### Working with docker

The easiest way to start developing is to work with docker.
Here is a quick setup; there are more detailed instructions in [here](./docs/development.md).

After you have installed docker, run the following command to spin up ganache (with the migrated contracts), the caching server and the alchemy server:
```sh
docker-compose up graph-node
```

Now, in a separate terminal run the following command to run snglsDAO:
```sh
npm run start
```

At this point you should be able to access snglsDAO web-app on http://127.0.0.1:3000.

See [working with docker](./docs/docker.md) for details and troubleshooting.
