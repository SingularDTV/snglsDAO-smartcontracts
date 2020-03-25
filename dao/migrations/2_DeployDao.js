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

  let SGTContract = artifacts.require("DAOToken");
  let AvatarContract = artifacts.require("Avatar");
  let ControllerContract = artifacts.require("Controller");
  let GlobalConstraintContract = artifacts.require("TokenCapGC");
  // let VotingContract = artifacts.require("AbsoluteVote");
  let ReputationContract = artifacts.require("Reputation");
  let LockingToken4ReputationContract = artifacts.require("LockingToken4Reputation");

  module.exports = async function(deployer) {

    let SGTInstance = await deployer.deploy(SGTContract,
      "Singularity Governance Token",
      "SGT",
      1000000, //todo change
      // {
      //   gas: 300000
      // } //todo find good value
    );

    let ReputationInstance = await deployer.deploy(ReputationContract);

    let AvatarInstance = await deployer.deploy(AvatarContract, 
      "Singularity",
      SGTContract.address,
      ReputationContract.address,
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

    let GlobalConstraintInstance = await deployer.deploy(GlobalConstraintContract);    

    ControllerInstance.addGlobalConstraint(
      GlobalConstraintContract.address,
      0x0,
      AvatarContract.address  
    );

    // Avatar _avatar,
    // uint256 _reputationReward,
    // uint256 _lockingStartTime,
    // uint256 _lockingEndTime,
    // uint256 _redeemEnableTime,
    // uint256 _maxLockingPeriod,
    // bytes32 _agreementHash
    let LockingToken4ReputationInstance = await deployer.deploy(LockingToken4ReputationContract,
      AvatarContract.address,
      10,
      0,
      2147483647, // max unix timestamp
      2419200, // 4 weeks
      2147483647, // max unix timestamp
      0x0 // WATT?
    );

    // address _scheme, 
    // bytes32 _paramsHash, 
    // bytes4 _permissions,
    // address _avatar
    ControllerInstance.registerScheme(
      LockingToken4ReputationContract.address,
      0x0,
      0x0,
      AvatarContract.address
    );


    
    // let VotingInstance = await deployer.deploy(VotingContract,
    
    // );
  



    // console.log(await ControllerInstance.globalConstraintsCount(AvatarContract.address));
  };
}

//     constructor(string memory _orgName, DAOToken _nativeToken, Reputation _nativeReputation) public {


// Deploy A, then deploy B, passing in A's newly deployed address
// deployer.deploy(A).then(function() {
//   return deployer.deploy(B, A.address);
// });

migrate()