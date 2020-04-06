require('dotenv').config();
async function migrate() {

const DAOstackMigration = require('@daostack/migration');

const options = {
  // arc version
  arcVersion: '0.0.1-rc.32',
  // web3 provider url
  provider: process.env.PROVIDER,
  // gas price in GWei. If not specified, will use an automatically suggested price.
  gasPrice: 3.4,
  // surpress console output
  quiet: false,
  // disable confirmation messages
  force: false,
  // delete previous deployment state and starts with clean state
  restart: true,

  mnemonic: '',
  // migration parameters
  output: process.env.OUTPUT_FILE,
  privateKey: process.env.PRIVATE_KEY,
  customAbisLocation: process.env.CUSTOM_ABI_LOCATION,

  params: {
    default: {
      // migration params as defined in the "Migration parameters" section below
    },
    private: {
        privateKey: '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d',
    },
    kovan: {
      // override defaults on kovan
    }
  }
};
console.log("1");
const migrationDAOResult = await DAOstackMigration.migrateDAO(options);
console.log("2");
migrationDAOResult.dao.Avatar; // DAO avatar address
// migrate an demo test scenario (requires an existing `output` file with a base migration)
console.log("3");
const migrationDemoResult = await DAOstackMigration.migrateDemoTest(options);
console.log("4");
migrationDemoResult.test.Avatar; // Test DAO avatar address
// migrate base, example DAO and demo test contracts
// const migrationResult = await DAOstackMigration.migrate(options); // migrate

// run the cli
// DAOstackMigration.cli();

}
console.log("0");
migrate()
console.log("9");