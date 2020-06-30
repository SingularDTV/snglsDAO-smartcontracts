const DAOstackMigration = require('@daostack/migration');

const options = {
  // arc version
  arcVersion: '0.0.1-rc.32',
  // web3 provider url
  provider: 'http://localhost:8545',
  // gas price in GWei. If not specified, will use an automatically suggested price.
  gasPrice: 20,
  // surpress console output
  quiet: true,
  // disable confirmation messages
  force: true,
  // delete previous deployment state and starts with clean state
  restart: false,
  // filepath to output the migration results
  output: 'migration.json',
  // private key of the account used in migration (overrides the 'mnemonic' option)
  privateKey: '0xa47518f56bd5a240e3d356cd55cba14d3d13829419d5cd26f9de34e79197c15b',

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
    }
  }
};

const migrationDAOResult = await DAOstackMigration.migrateDAO(options);
migrationDAOResult.dao.Avatar; // DAO avatar address
// migrate an demo test scenario (requires an existing `output` file with a base migration)
const migrationDemoResult = await DAOstackMigration.migrateDemoTest(options);
migrationDemoResult.test.Avatar; // Test DAO avatar address
// migrate base, example DAO and demo test contracts
const migrationResult = await DAOstackMigration.migrate(options); // migrate

// run the cli
DAOstackMigration.cli();