const DAOstackMigration = require('@daostack/migration');

// ganache-core object with already migrated contracts
// options are as specified in https://github.com/trufflesuite/ganache-cli#library
// DAOstackMigration.Ganache.server(..);
// DAOstackMigration.Ganache.provider(..);
// choose the network to get addressed for. Either private (ganache), kovan, rinkeby, mainnet.
let network = 'private'
// migration result object for ganache
DAOstackMigration.migration(network);

const options = {
  // arc version
  arcVersion: '0.0.1-rc.32',
  // web3 provider url
  provider: 'http://localhost:8545',
  // gas price in GWei. If not specified, will use an automatically suggested price.
  gasPrice: 3.4,
  // suppress console output
  quiet: true,
  // disable confirmation messages
  disableConfs: true,
  // force deploy everything
  force: true,
  // delete previous deployment state and starts with clean state
  restart: false,
  // filepath to output the migration results
  output: 'migration.json',
  // private key of the account used in migration (overrides the 'mnemonic' option)
  privateKey: '0xa47518f56bd5a240e3d356cd55cba14d3d13829419d5cd26f9de34e79197c15b',
  // mnemonic used to generate the private key of the account used in migration
	mnemonic: 'one two three ...',
	// migration parameters
	params: {
		default: {
			// migration params as defined in the "Migration parameters" section below
		},
		private: {
			// override defaults on private network
		},
		kovan: {
			// override defaults on kovan
		},
	},
};

// migrate base contracts
const migrationBaseResult = await DAOstackMigration.migrateBase(options);
migrationBaseResult.base.GenesisProtocol // migrated genesis protocol address
// migrate an example DAO (requires an existing `output` file with a base migration)
const migrationDAOResult = await DAOstackMigration.migrateDAO(options);
migrationDAOResult.dao.Avatar // DAO avatar address
// migrate an demo test scenario (requires an existing `output` file with a base migration)
const migrationDemoResult = await DAOstackMigration.migrateDemoTest(options);
migrationDemoResult.test.Avatar // Test DAO avatar address
// migrate base, example DAO and demo test contracts
const migrationResult = await DAOstackMigration.migrate(options); // migrate

// run the cli
DAOstackMigration.cli()