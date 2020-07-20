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

## snglsDAO Subgraph

snglsDAO subgraph for [TheGraph](https://thegraph.com/) project.

Our latest subgraph (https://thegraph.com/explorer/subgraph/singulardtv/sngls-dao).

### Getting started

1. `git clone https://github.com/blaize-tech/snglsDAO-smartcontracts.git && cd s2`
2. `npm install`

### Testing

Run the tests in the host container:

```sh
npm run docker:run
npm run test
npm run docker:stop
```

The tests are run with jest, which takes a number of options that may be useful when developing:

```sh
npm run test -- --watch # re-run the tests after each change
npm run test -- test/integration/Avatar.spec.js # run a single test file
```

### Commands

1. `migrate` - migrate contracts to ganache and write result to `migration.json`.
2. `codegen` - (requires `migration.json`) automatically generate abi, subgraph, schema and type definitions for
   required contracts.
3. `test` - run integration test.
4. `deploy` - deploy subgraph.
5. `deploy:watch` - redeploy on file change.

Docker commands (requires installing [`docker`](https://docs.docker.com/v17.12/install/) and
[`docker-compose`](https://docs.docker.com/compose/install/)):

1. `docker <command>` - start a command running inside the docker container. Example: `npm run docker test` (run
   intergation tests).
2. `docker:stop` - stop all running docker services.
3. `docker:rebuild <command>` - rebuild the docker container after changes to `package.json`.
4. `docker:logs <subgraph|graph-node|ganache|ipfs|postgres>` - display logs from a running docker service.
5. `docker:run` - run all services in detached mode (i.e. in the background).

### Exposed endpoints

After running a command with docker-compose, the following endpoints will be exposed on your local machine:

- `http://localhost:8000/subgraphs/name/daostack` - GraphiQL graphical user interface.
- `http://localhost:8000/subgraphs/name/daostack/graphql` - GraphQL api endpoint.
- `http://localhost:8001/subgraphs/name/daostack` - graph-node's websockets endpoint
- `http://localhost:8020` - graph-node's RPC endpoint
- `http://localhost:5001` - ipfs endpoint.
- (if using development) `http://localhost:8545` - ganache RPC endpoint.
- `http://localhost:5432` - postgresql connection endpoint.

### Add a new contract tracker

In order to add support for a new contract follow these steps:

1. Create a new directory `src/mappings/<contract name>/`
2. Create 4 files:

   1. `src/mappings/<contract name>/mapping.ts` - mapping code.
   2. `src/mappings/<contract name>/schema.graphql` - GraphQL schema for that contract.
   3. `src/mappings/<contract name>/datasource.yaml` - a yaml fragment with:
      1. `abis` - optional - list of contract names that are required by the mapping.
      2. [`entities`](https://github.com/graphprotocol/graph-node/blob/master/docs/subgraph-manifest.md#1521-ethereum-events-mapping) -
         list of entities that are written by the the mapping.
      3. [`eventHandlers`](https://github.com/graphprotocol/graph-node/blob/master/docs/subgraph-manifest.md#1522-eventhandler) -
         map of solidity event signatures to event handlers in mapping code.
   4. `test/integration/<contract name>.spec.ts`

3. Add your contract to `ops/mappings.json`. Under the JSON object for the network your contract is located at, under the `"mappings"` JSON array, add the following.

   1. If your contract information is in the `migration.json` file specified (default is the file under `@daostack/migration` folder, as defined in the `ops/settings.js` file):

      ```json
      {
         "name": "<contract name as appears in `abis/arcVersion` folder>",
         "contractName": "<contract name as appears in migration.json file>",
         "dao": "<section label where contract is defined in migration.json file (base/ dao/ test/ organs)>",
         "mapping": "<contract name from step 2>",
         "arcVersion": "<contract arc version>"
      }
      ```

   2. If your contract does not appear in the migration file:

      ```json
      {
         "name": "<contract name as appears in `abis/arcVersion` folder>",
         "dao": "address",
         "mapping": "<contract name from step 2>",
         "arcVersion": "<contract arc version under which the abi is located in the `abis` folder>",
         "address": "<the contract address>"
      }
      ```

4. (Optionally) add a deployment step for your contract in `ops/migrate.js` that will run before testing.

### Add a new dao tracker

To index a DAO please follow the instructions here: [https://github.com/daostack/subgraph/blob/master/documentations/Deployment.md#indexing-a-new-dao](https://github.com/daostack/subgraph/blob/master/documentations/Deployment.md#indexing-a-new-dao)

### Add a new datasource template

Datasource templates allow you to index blockchain data from addresses the subgraph finds out about at runtime. This is used to dynamically index newly deployed DAOs. To add a new contract ABI that can be used as a template within your mappings, modify the `ops/templates.json` file like so:

```json
{
   "templates": [
      ...,
      {
         "name": "<contract name as appears in `abis/arcVersion` folder>",
         "mapping": "<name of the `src/mappings/...` folder to be used with this contract>",
         "start_arcVersion": "<contract arc version under which the abi is located in the `abis` folder>",
         "end_arcVersion": "(optional) <contract arc version under which the abi is located in the `abis` folder> if not given, all future versions of this `name`'s contract ABI will be added as a template for this mapping"
      }
   ]
}
```

### Deploy Subgraph

To deploy the subgraph, please follow the instructions below:

1. If you are deploying to The Graph for the first time, start with installing the Graph CLI:
`npm install -g @graphprotocol/graph-cli`
Then follow this by logging into your Graph Explorer account using:
`graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>`

   It is also recommended to read this guide: [https://thegraph.com/docs/deploy-a-subgraph](https://thegraph.com/docs/deploy-a-subgraph)

2. Create a `.env` file containing the following:

   ```bash
   network="<TARGET_NETWORK>"
   subgraph="<YOUR_SUBGAPH_NAME>"

   # Not necessary for Docker deployment
   graph_node="https://api.thegraph.com/deploy/"
   ipfs_node="https://api.thegraph.com/ipfs/"
   access_token=<YOUR_ACCESS_TOKEN>

   # Not necessary for The Graph server
   postgres_password=<YOUR_PASSWORD>
   ethereum_node="https://<TARGET_NETWORK>.infura.io/<INFURA-KEY>"
   start_block=<START INDEX BLOCK> (default is 0)
   ```

3. Run: ``npm run deploy``

### Release subgraph images on docker hub

The repository provides a `release.sh` script that will:

- (re)start the docker containers and deploy the subgraph
- commit the images for ipfs and postgres and push these to docker hub

The docker images are available as:

`daostack/subgraph-postgres:${network}-${migration-version}-${subgraph-version}`
`daostack/subgraph-ipfs:${network}-${migration-version}-${subgraph-version}`

### Blacklist a malicious DAO
Add the DAO's Avatar address to the `ops/blacklist.json` file in the proper network array. For example, blacklisting `0xF7074b67B4B7830694a6f58Df06375F00365d2c2` on mainnet would look like:
```json
{
  "private": [],
  "kovan": [],
  "rinkeby": [],
  "mainnet": [
     "0xF7074b67B4B7830694a6f58Df06375F00365d2c2"
  ]
}
```
