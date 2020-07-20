# snglsDAO web-app

## Dependencies:
* [NVM](https://github.com/creationix/nvm#installation) can be helpful to manage different versions of node
* [NodeJS 9.4 or greater + NPM](https://github.com/creationix/nvm#usage)
* You will  need [alchemy-server](https://github.com/daostack/alchemy-server) running locally for the app to function

## Installation

```sh
sudo apt-get install -y libsecret-1-dev
git clone https://github.com/daostack/alchemy.git
cd alchemy
npm ci
```

# Run app locally

There are two ways to work with the snglsDAO.
There is `docker-compose` file for quick setup. Alternatively,
you can recreate the docker environment by installing an starting all [services locally](./docs/nodocker.md).

## Working with docker

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
