// const DAOstackMigration = require('@daostack/migration');
const migrationSpec =  require('../data/snglDAOspec.json')
require('dotenv').config();

async function migrate() {
  const DEFAULT_GAS = 1000

  const options = {
    provider: process.env.PROVIDER,
    gasPrice: DEFAULT_GAS,
    quiet: false,
    force: true,
    restart: true,
    output: process.env.OUTPUT_FILE,
    // privateKey: process.env.PRIVATE_KEY,
    customAbisLocation: process.env.CUSTOM_ABI_LOCATION,
    params: {
      private: migrationSpec,
      rinkeby: migrationSpec
    },
  };

  // TODO: If not using ganache docker image by DAOstack un-comment this portion
  // to migrate base contracts
  /*
    switch (process.env.NETWORK) {
      case "private":
        const migrationBaseResult = await DAOstackMigration.migrateBase(options);
        options.prevmigration = options.output;
        break;
    }
  */
  // const migrationDAOResult = await DAOstackMigration.migrateDAO(options);

  let SGTContract = artifacts.require("DAOToken");
  let AvatarContract = artifacts.require("Avatar")
  let ControllerContract = artifacts.require("Controller")
  let GlobalConstraintContract = artifacts.require("TokenCapGC")

  module.exports = async function(deployer) {
    // deployment steps
    let SGTInstance = await deployer.deploy(SGTContract,
      "Singularity Governance Token",
      "SGT",
      1000000, //todo change
      // {
      //   gas: 300000
      // } //todo find good value
    );

    let AvatarInstance = await deployer.deploy(AvatarContract, 
      "Singularity",
      SGTContract.address,
      SGTContract.address, // replace with reputation contract address
      // {
      //   gas: 300000
      // } //todo find good value

    );

    let ControllerInstance = await deployer.deploy(ControllerContract,
      AvatarContract.address,
      // {
        // gas: 1352796, 
      // } //todo find good value
    );

    let GlobalConstraintInstance = await deployer.deploy(GlobalConstraintContract) 

    ControllerInstance.addGlobalConstraint(
      GlobalConstraintContract.address,
      0x0,
      AvatarContract.address  
    );

    console.log(await ControllerInstance.globalConstraintsCount(AvatarContract.address));
  };
}

//     constructor(string memory _orgName, DAOToken _nativeToken, Reputation _nativeReputation) public {


// Deploy A, then deploy B, passing in A's newly deployed address
// deployer.deploy(A).then(function() {
//   return deployer.deploy(B, A.address);
// });

migrate()