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
  let VotingContract = artifacts.require("GenesisProtocol");
  let GENContract = artifacts.require("GENToken");
  let FeeContract = artifacts.require("Fee");
  let GenericSchemeContract = artifacts.require("GenericScheme");
  let PriceOracle = artifacts.require("TokenLockingOracle");
  const MembershipFeeStakingContract = artifacts.require("MembershipFeeStaking");
  module.exports = async function (deployer, network, accounts) {

    let SGTInstance = await deployer.deploy(SGTContract,
      "Singularity Governance Token",
      "SGT",
      1000000, // todo: use SNGLS cap
    );

    let ReputationInstance = await deployer.deploy(ReputationContract);
    for (let i = 0; i <= 3; i++) {
      await ReputationInstance.mint(accounts[i], 1000);
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
    let GENInstance = await deployer.deploy(GENContract, "GENToken", "GEN", 0);
    let VotingInstance = await deployer.deploy(VotingContract, GENInstance.address);
    let FeeSchemeInstance = await deployer.deploy(GenericSchemeContract);
    let FeeInstance = await deployer.deploy(FeeContract,
      100, //listing fee
      10, //transaction fee
      1000, //validation fee,
      1 //membership fee
    );
    let PriceOracleInstance = await deployer.deploy(PriceOracle, SGTContract.address);
    let MembershipFeeStakingInstance = await deployer.deploy(MembershipFeeStakingContract, SGTContract.address);
    //genesisProtocolParameters a parameters array
    //genesisProtocolParameters[0] - _queuedVoteRequiredPercentage,
    //genesisProtocolParameters[1] - _queuedVotePeriodLimit, //the time limit for a proposal to be in an absolute voting mode.
    //genesisProtocolParameters[2] - _boostedVotePeriodLimit, //the time limit for a proposal to be in an relative voting mode.
    //genesisProtocolParameters[3] - _preBoostedVotePeriodLimit, //the time limit for a proposal to be in an preparation
    //                                                             state (stable) before boosted.
    //genesisProtocolParameters[4] -_thresholdConst
    //genesisProtocolParameters[5] -_quietEndingPeriod
    //genesisProtocolParameters[6] -_proposingRepReward
    //genesisProtocolParameters[7] -_votersReputationLossRatio
    //genesisProtocolParameters[8] -_minimumDaoBounty
    //genesisProtocolParameters[9] -_daoBountyConst
    //genesisProtocolParameters[10] -_activationTime
    let genesisProtocolParameters = [
      51, //  -  _queuedVoteRequiredPercentage,
      100, // -  _queuedVotePeriodLimit, //the time limit for a proposal to be in an absolute voting mode.
      100, // -  _boostedVotePeriodLimit, //the time limit for a proposal to be in an relative voting mode.
      50, //  -  _preBoostedVotePeriodLimit, //the time limit for a proposal to be in an preparation
      //                                       state (stable) before boosted.
      2000, //   - _thresholdConst
      20, //  - _quietEndingPeriod
      10, //  - _proposingRepReward
      10, //  - _votersReputationLossRatio
      1, //   - _minimumDaoBounty
      10, //  - _daoBountyConst
      10 //   -_activationTime
    ];
    await ContributionRewardExtInstance.initialize(AvatarContract.address, VotingInstance.address, await VotingInstance.getParametersHash(genesisProtocolParameters, '0x0000000000000000000000000000000000000000'), '0x0000000000000000000000000000000000000000');
    await FeeSchemeInstance.initialize(
      AvatarInstance.address,
      VotingInstance.address,
      await VotingInstance.getParametersHash(genesisProtocolParameters, '0x0000000000000000000000000000000000000000'),
      FeeInstance.address
    )
    await VotingInstance.setParameters(genesisProtocolParameters, '0x0000000000000000000000000000000000000000');
    await AvatarInstance.transferOwnership(ControllerInstance.address);
    await ReputationInstance.transferOwnership(ControllerInstance.address);
    await FeeInstance.transferOwnership(AvatarInstance.address);
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
    console.log(PriceOracleInstance.address);
    let LockingToken4ReputationInstance = await deployer.deploy(LockingToken4ReputationContract);
    LockingToken4ReputationInstance.initialize(AvatarContract.address,
      10000000000,
      0,
      2147483646, // max unix timestamp
      2147483646, // 4 weeks
      2147483647, // max unix timestamp,
      PriceOracleInstance.address,
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

    ControllerInstance.registerScheme(ContributionRewardExtInstance.address, "0x0", "0xFFFFFFFF", AvatarInstance.address);
    ControllerInstance.registerScheme(FeeSchemeInstance.address, "0x0", "0xFFFFFFFF", AvatarInstance.address);
  };
}

migrate();