import { store, log } from "@graphprotocol/graph-ts"
import {
  NewContributionProposal,
  ProposalExecuted,
  RedeemEther,
  RedeemExternalToken
} from "../../types/CustomContributionReward/CustomContributionReward"
import { CustomContributionReward } from "../../types/schema"
import { eventId } from '../../utils';


export function handleNewContributionProposal(
  event: NewContributionProposal
): void {
  log.info('handleNewContributionProposal start: {}', [
    'already a string'
  ]);
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type

  let ent = new CustomContributionReward(eventId(event));
  //entity.count = BigInt.fromI32(0)

  //let entity = CustomContributionReward.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  /*if (entity == null) {
    entity = new CustomContributionReward(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }*/

  // BigInt and BigDecimal math are supported
  //entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  ent._avatar = event.params._avatar;
  ent._proposalId = event.params._proposalId;
  ent._intVoteInterface = event.params._intVoteInterface;
  ent._beneficiary = event.params._beneficiary;
  ent._descriptionHash = event.params._descriptionHash;
  ent.externalToken = event.params._externalToken;
  let rewards = event.params._rewards;
  ent.nativeTokenReward = rewards.shift(); // native tokens
  ent.ethReward = rewards.shift(); // eth
  ent.externalTokenReward = rewards.shift(); // external tokens
  ent.periodLength = rewards.shift(); // period length
  ent.periods = rewards.shift();
 // number of periods
  /*log.info('handleNewContributionProposal start: {}, {}, {}', [
    'already a string',
    entity._avatar,
    entity._proposalId
  ])*/
  // Entities can be written to the store with `.save()`
  //entity.save()
  store.set('CustomContributionReward', ent.id, ent);
  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.balanceOfStakingToken(...)
  // - contract.burnReputation(...)
  // - contract.getTotalReputationSupply(...)
  // - contract.mintReputation(...)
  // - contract.organizationsProposals(...)
  // - contract.parameters(...)
  // - contract.proposalsInfo(...)
  // - contract.reputationOf(...)
  // - contract.stakingTokenTransfer(...)
  // - contract.executeProposal(...)
  // - contract.setParameters(...)
  // - contract.proposeContributionReward(...)
  // - contract.redeemEther(...)
  // - contract.redeemExternalToken(...)
  // - contract.redeem(...)
  // - contract.getPeriodsToPay(...)
  // - contract.getRedeemedPeriods(...)
  // - contract.getProposalEthReward(...)
  // - contract.getProposalExternalTokenReward(...)
  // - contract.getProposalExternalToken(...)
  // - contract.getProposalExecutionTime(...)
  // - contract.getParametersHash(...)
}

export function handleProposalExecuted(event: ProposalExecuted): void {}

export function handleRedeemEther(event: RedeemEther): void {}

export function handleRedeemExternalToken(event: RedeemExternalToken): void {}
