/**
    helpers for tests
*/

const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const Reputation = artifacts.require("./Reputation.sol");
const AbsoluteVote = artifacts.require("./AbsoluteVote.sol");
const constants = require('./constants');
const GenesisProtocol = artifacts.require("./GenesisProtocol.sol");

module.exports.MAX_UINT_256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
module.exports.NULL_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
module.exports.SOME_HASH = '0x1000000000000000000000000000000000000000000000000000000000000000';
module.exports.NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
module.exports.SOME_ADDRESS = '0x1000000000000000000000000000000000000000';

class TestSetup {
  constructor() {}
}

module.exports.TestSetup = TestSetup;

class VotingMachine {
  constructor() {}
}

module.exports.VotingMachine = VotingMachine;

class Organization {
  constructor() {}
}

module.exports.Organization = Organization;

module.exports.getProposalAddress = function getProposalAddress(tx) {
  // helper function that returns a proposal object from the ProposalCreated event
  // in the logs of tx
  assert.equal(tx.logs[0].event, 'ProposalCreated');
  const proposalAddress = tx.logs[0].args.proposaladdress;
  return proposalAddress;
}

module.exports.getValueFromLogs = function getValueFromLogs(tx, arg, eventName, index = 0) {
  /**
   *
   * tx.logs look like this:
   *
   * [ { logIndex: 13,
   *     transactionIndex: 0,
   *     transactionHash: '0x999e51b4124371412924d73b60a0ae1008462eb367db45f8452b134e5a8d56c8',
   *     blockHash: '0xe35f7c374475a6933a500f48d4dfe5dce5b3072ad316f64fbf830728c6fe6fc9',
   *     blockNumber: 294,
   *     address: '0xd6a2a42b97ba20ee8655a80a842c2a723d7d488d',
   *     type: 'mined',
   *     event: 'NewOrg',
   *     args: { _avatar: '0xcc05f0cde8c3e4b6c41c9b963031829496107bbb' } } ]
   */
  if (!tx.logs || !tx.logs.length) {
    throw new Error('getValueFromLogs: Transaction has no logs');
  }

  if (eventName !== undefined) {
    for (let i = 0; i < tx.logs.length; i++) {
      if (tx.logs[i].event === eventName) {
        index = i;
        break;
      }
    }
    if (index === undefined) {
      let msg = `getValueFromLogs: There is no event logged with eventName ${eventName}`;
      throw new Error(msg);
    }
  } else {
    if (index === undefined) {
      index = tx.logs.length - 1;
    }
  }
  let result = tx.logs[index].args[arg];
  if (!result) {
    let msg = `getValueFromLogs: This log does not seem to have a field "${arg}": ${tx.logs[index].args}`;
    throw new Error(msg);
  }
  return result;
}

module.exports.getProposal = async function getProposal(tx) {
  return await Proposal.at(getProposalAddress(tx));
}

module.exports.etherForEveryone = async function etherForEveryone(accounts) {
  // give all web3.eth.accounts some ether
  for (let i = 0; i < 10; i++) {
    await web3.eth.sendTransaction({
      to: accounts[i],
      from: accounts[0],
      value: web3.utils.toWei("0.1", "ether")
    });
  }
}

module.exports.outOfGasMessage = 'VM Exception while processing transaction: out of gas';

module.exports.assertJumpOrOutOfGas = function assertJumpOrOutOfGas(error) {
  let condition = (
    error.message === outOfGasMessage ||
    error.message.search('invalid JUMP') > -1
  );
  assert.isTrue(condition, 'Expected an out-of-gas error or an invalid JUMP error, got this instead: ' + error.message);
}

module.exports.assertVMException = function assertVMException(error) {
  let condition = (
    error.message.search('VM Exception') > -1
  );
  assert.isTrue(condition, 'Expected a VM Exception, got this instead:' + error.message);
}

module.exports.assertInternalFunctionException = function assertInternalFunctionException(error) {
  let condition = (
    error.message.search('is not a function') > -1
  );
  assert.isTrue(condition, 'Expected a function not found Exception, got this instead:' + error.message);
}

module.exports.assertJump = function assertJump(error) {
  assert.isAbove(error.message.search('invalid JUMP'), -1, 'Invalid JUMP error must be returned' + error.message);
}

module.exports.setupAbsoluteVote = async function (voteOnBehalf = NULL_ADDRESS, precReq = 50) {
  var votingMachine = new VotingMachine();
  votingMachine.absoluteVote = await AbsoluteVote.new();
  // register some parameters
  await votingMachine.absoluteVote.setParameters(precReq, voteOnBehalf);
  votingMachine.params = await votingMachine.absoluteVote.getParametersHash(precReq, voteOnBehalf);
  return votingMachine;
};

module.exports.setupGenesisProtocol = async function (
  accounts,
  token,
  avatar,
  voteOnBehalf = NULL_ADDRESS,
  _queuedVoteRequiredPercentage = 50,
  _queuedVotePeriodLimit = 60,
  _boostedVotePeriodLimit = 60,
  _preBoostedVotePeriodLimit = 0,
  _thresholdConst = 2000,
  _quietEndingPeriod = 0,
  _proposingRepReward = 60,
  _votersReputationLossRatio = 10,
  _minimumDaoBounty = 15,
  _daoBountyConst = 10,
  _activationTime = 0
) {
  var votingMachine = new VotingMachine();

  votingMachine.genesisProtocol = await GenesisProtocol.new(token, {
    gas: constants.ARC_GAS_LIMIT
  });

  // set up a reputation system
  votingMachine.reputationArray = [20, 10, 70];
  // register some parameters
  await votingMachine.genesisProtocol.setParameters([_queuedVoteRequiredPercentage,
    _queuedVotePeriodLimit,
    _boostedVotePeriodLimit,
    _preBoostedVotePeriodLimit,
    _thresholdConst,
    _quietEndingPeriod,
    _proposingRepReward,
    _votersReputationLossRatio,
    _minimumDaoBounty,
    _daoBountyConst,
    _activationTime
  ], voteOnBehalf);
  votingMachine.params = await votingMachine.genesisProtocol.getParametersHash([_queuedVoteRequiredPercentage,
    _queuedVotePeriodLimit,
    _boostedVotePeriodLimit,
    _preBoostedVotePeriodLimit,
    _thresholdConst,
    _quietEndingPeriod,
    _proposingRepReward,
    _votersReputationLossRatio,
    _minimumDaoBounty,
    _daoBountyConst,
    _activationTime
  ], voteOnBehalf);

  return votingMachine;
};

module.exports.setupOrganizationWithArrays = async function (daoCreator, daoCreatorOwner, founderToken, founderReputation, cap = 0) {
  var org = new Organization();
  var tx = await daoCreator.forgeOrg("testOrg", "TEST", "TST", daoCreatorOwner, founderToken, founderReputation, cap, {
    gas: constants.ARC_GAS_LIMIT
  });
  assert.equal(tx.logs.length, 1);
  assert.equal(tx.logs[0].event, "NewOrg");
  var avatarAddress = tx.logs[0].args._avatar;
  org.avatar = await Avatar.at(avatarAddress);
  var tokenAddress = await org.avatar.nativeToken();
  org.token = await DAOToken.at(tokenAddress);
  var reputationAddress = await org.avatar.nativeReputation();
  org.reputation = await Reputation.at(reputationAddress);
  return org;
};

module.exports.setupOrganization = async function (daoCreator, daoCreatorOwner, founderToken, founderReputation, cap = 0) {
  var org = new Organization();
  var tx = await daoCreator.forgeOrg("testOrg", "TEST", "TST", [daoCreatorOwner], [founderToken], [founderReputation], cap, {
    gas: constants.ARC_GAS_LIMIT
  });
  assert.equal(tx.logs.length, 1);
  assert.equal(tx.logs[0].event, "NewOrg");
  var avatarAddress = tx.logs[0].args._avatar;
  org.avatar = await Avatar.at(avatarAddress);
  var tokenAddress = await org.avatar.nativeToken();
  org.token = await DAOToken.at(tokenAddress);
  var reputationAddress = await org.avatar.nativeReputation();
  org.reputation = await Reputation.at(reputationAddress);
  return org;
};


module.exports.checkVoteInfo = async function (absoluteVote, proposalId, voterAddress, _voteInfo) {
  let voteInfo;
  voteInfo = await absoluteVote.voteInfo(proposalId, voterAddress);
  // voteInfo has the following structure
  // int256 vote;
  assert.equal(voteInfo[0].toNumber(), _voteInfo[0]);
  // uint256 reputation;
  assert.equal(voteInfo[1].toNumber(), _voteInfo[1]);
};


module.exports.checkVotesStatus = async function (proposalId, _votesStatus, votingMachine) {

  let voteStatus;
  for (var i = 0; i < _votesStatus.length; i++) {
    voteStatus = await votingMachine.voteStatus(proposalId, i);
    assert.equal(voteStatus, _votesStatus[i]);
  }
};

module.exports.getProposalId = async function getProposalId(tx, contract, eventName) {
  var proposalId;
  await contract.getPastEvents(eventName, {
      fromBlock: tx.blockNumber,
      toBlock: 'latest'
    })
    .then(function (events) {
      proposalId = events[0].args._proposalId;
    });
  return proposalId;
}

// module.exports.increaseTime  = async function (addSeconds) {
//     web3.currentProvider.sendAsync({
//       jsonrpc: '2.0',
//       method: 'evm_increaseTime',
//       params: [addSeconds],
//       id: new Date().getSeconds()
//     }, (err) => {
//       if (!err) {
//         web3.currentProvider.send({
//           jsonrpc: '2.0',
//           method: 'evm_mine',
//           params: [],
//           id: new Date().getSeconds()
//         });
//       }
//     });
//   }
// Increases testrpc time by the passed duration in seconds
module.exports.increaseTime = async function (duration) {
  const id = await Date.now();

  web3.providers.HttpProvider.prototype.sendAsync = web3.providers.HttpProvider.prototype.send;

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id: id,
    }, err1 => {
      if (err1) return reject(err1);

      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: id + 1,
      }, (err2, res) => {
        return err2 ? reject(err2) : resolve(res);
      });
    });
  });
};