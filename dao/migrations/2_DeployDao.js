// const DAOstackMigration = require('@daostack/migration');
const migrationSpec = require('../data/snglDAOspec.json')
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
  let ReputationContract = artifacts.require("Reputation");
  let LockingToken4ReputationContract = artifacts.require("LockingToken4Reputation");
  let ContributionRewardExtContract = artifacts.require("ContributionRewardExt");
  let VotingContract = artifacts.require("AbsoluteVote");
  
  module.exports = async function (deployer, network, accounts) {

    let SGTInstance = await deployer.deploy(SGTContract,
      "Singularity Governance Token",
      "SGT",
      1000000, // todo: use SNGLS cap
    );

    let ReputationInstance = await deployer.deploy(ReputationContract);
    for (let i = 0; i <= 5; i++) {
      await ReputationInstance.mint(accounts[i], 100);
    }

    let AvatarInstance = await deployer.deploy(AvatarContract,
      "Singularity",
      SGTContract.address,
      ReputationContract.address,
    );

    let ControllerInstance = await deployer.deploy(ControllerContract,
      AvatarContract.address,
    );

    let GlobalConstraintInstance = await deployer.deploy(GlobalConstraintContract);
    let ContributionRewardExtInstance = await deployer.deploy(ContributionRewardExtContract);
    let VotingInstance = await deployer.deploy(VotingContract);
    await ContributionRewardExtInstance.initialize(AvatarContract.address, VotingInstance.address, await VotingInstance.getParametersHash(51, '0x0000000000000000000000000000000000000000'), '0x0000000000000000000000000000000000000000');
    await VotingInstance.setParameters(51, '0x0000000000000000000000000000000000000000');
    await ControllerInstance.registerScheme(ContributionRewardExtInstance.address, "0x0", "0xFFFFF", AvatarInstance.address);
    await AvatarInstance.transferOwnership(ControllerInstance.address);
    await ReputationInstance.transferOwnership(ControllerInstance.address);
    // ControllerInstance.addGlobalConstraint(
    //   GlobalConstraintContract.address,
    //   "0x0",
    //   AvatarContract.address
    // );



    // let VotingInstance = await deployer.deploy(VotingContract,

    // );



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
      "0x0" // WATT?
    );

    // address _scheme, 
    // bytes32 _paramsHash, 
    // bytes4 _permissions,
    // address _avatar
    ControllerInstance.registerScheme(
      LockingToken4ReputationContract.address,
      "0x0",
      "0x0",
      AvatarContract.address
    );
  };
}

migrate();