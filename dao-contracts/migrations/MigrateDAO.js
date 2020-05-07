require('dotenv').config();
async function migrate() {
  const fs = require("fs");
  const DAOstackMigration = require('./migration');

  const options = {
    // arc version
    arcVersion: '0.0.1-rc.39',
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

    mnemonic: process.env.MNEMONIC,
    // migration parameters
    output: process.env.OUTPUT_FILE,
    privateKey: process.env.PRIVATE_KEY,
    customAbisLocation: process.env.CUSTOM_ABI_LOCATION,

    params: JSON.parse(fs.readFileSync("./data/snglDAOspec.json"))
    // params: {
    //   default: {
    //     // migration params as defined in the "Migration parameters" section below
    //   },
    //   private: {
    //       privateKey: '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d',
    //   },
    //   kovan: {
    //     // override defaults on kovan
    //   }
    // }
  };
  const migrationDAOResult = await DAOstackMigration.migrateDAO(options);
  migrationDAOResult.dao.Avatar; // DAO avatar address

}
migrate()