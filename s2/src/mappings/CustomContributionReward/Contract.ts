// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class NewContributionProposal extends ethereum.Event {
  get params(): NewContributionProposal__Params {
    return new NewContributionProposal__Params(this);
  }
}

export class NewContributionProposal__Params {
  _event: NewContributionProposal;

  constructor(event: NewContributionProposal) {
    this._event = event;
  }

  get _avatar(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get _proposalId(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }

  get _intVoteInterface(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get _descriptionHash(): string {
    return this._event.parameters[3].value.toString();
  }

  get _rewards(): Array<BigInt> {
    return this._event.parameters[4].value.toBigIntArray();
  }

  get _externalToken(): Address {
    return this._event.parameters[5].value.toAddress();
  }

  get _beneficiary(): Address {
    return this._event.parameters[6].value.toAddress();
  }
}

export class ProposalExecuted extends ethereum.Event {
  get params(): ProposalExecuted__Params {
    return new ProposalExecuted__Params(this);
  }
}

export class ProposalExecuted__Params {
  _event: ProposalExecuted;

  constructor(event: ProposalExecuted) {
    this._event = event;
  }

  get _avatar(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get _proposalId(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }

  get _param(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class RedeemEther extends ethereum.Event {
  get params(): RedeemEther__Params {
    return new RedeemEther__Params(this);
  }
}

export class RedeemEther__Params {
  _event: RedeemEther;

  constructor(event: RedeemEther) {
    this._event = event;
  }

  get _avatar(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get _proposalId(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }

  get _beneficiary(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get _amount(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class RedeemExternalToken extends ethereum.Event {
  get params(): RedeemExternalToken__Params {
    return new RedeemExternalToken__Params(this);
  }
}

export class RedeemExternalToken__Params {
  _event: RedeemExternalToken;

  constructor(event: RedeemExternalToken) {
    this._event = event;
  }

  get _avatar(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get _proposalId(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }

  get _beneficiary(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get _amount(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class Contract__organizationsProposalsResult {
  value0: BigInt;
  value1: Address;
  value2: BigInt;
  value3: Address;
  value4: BigInt;
  value5: BigInt;
  value6: BigInt;

  constructor(
    value0: BigInt,
    value1: Address,
    value2: BigInt,
    value3: Address,
    value4: BigInt,
    value5: BigInt,
    value6: BigInt
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
    this.value6 = value6;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromAddress(this.value1));
    map.set("value2", ethereum.Value.fromUnsignedBigInt(this.value2));
    map.set("value3", ethereum.Value.fromAddress(this.value3));
    map.set("value4", ethereum.Value.fromUnsignedBigInt(this.value4));
    map.set("value5", ethereum.Value.fromUnsignedBigInt(this.value5));
    map.set("value6", ethereum.Value.fromUnsignedBigInt(this.value6));
    return map;
  }
}

export class Contract__parametersResult {
  value0: Bytes;
  value1: Address;

  constructor(value0: Bytes, value1: Address) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromFixedBytes(this.value0));
    map.set("value1", ethereum.Value.fromAddress(this.value1));
    return map;
  }
}

export class Contract__proposalsInfoResult {
  value0: BigInt;
  value1: Address;

  constructor(value0: BigInt, value1: Address) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromAddress(this.value1));
    return map;
  }
}

export class Contract__redeemResult {
  value0: BigInt;
  value1: BigInt;

  constructor(value0: BigInt, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }
}

export class Contract extends ethereum.SmartContract {
  static bind(address: Address): Contract {
    return new Contract("Contract", address);
  }

  balanceOfStakingToken(_stakingToken: Address, _proposalId: Bytes): BigInt {
    let result = super.call(
      "balanceOfStakingToken",
      "balanceOfStakingToken(address,bytes32):(uint256)",
      [
        ethereum.Value.fromAddress(_stakingToken),
        ethereum.Value.fromFixedBytes(_proposalId)
      ]
    );

    return result[0].toBigInt();
  }

  try_balanceOfStakingToken(
    _stakingToken: Address,
    _proposalId: Bytes
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "balanceOfStakingToken",
      "balanceOfStakingToken(address,bytes32):(uint256)",
      [
        ethereum.Value.fromAddress(_stakingToken),
        ethereum.Value.fromFixedBytes(_proposalId)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  burnReputation(
    _amount: BigInt,
    _beneficiary: Address,
    _proposalId: Bytes
  ): boolean {
    let result = super.call(
      "burnReputation",
      "burnReputation(uint256,address,bytes32):(bool)",
      [
        ethereum.Value.fromUnsignedBigInt(_amount),
        ethereum.Value.fromAddress(_beneficiary),
        ethereum.Value.fromFixedBytes(_proposalId)
      ]
    );

    return result[0].toBoolean();
  }

  try_burnReputation(
    _amount: BigInt,
    _beneficiary: Address,
    _proposalId: Bytes
  ): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "burnReputation",
      "burnReputation(uint256,address,bytes32):(bool)",
      [
        ethereum.Value.fromUnsignedBigInt(_amount),
        ethereum.Value.fromAddress(_beneficiary),
        ethereum.Value.fromFixedBytes(_proposalId)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  getTotalReputationSupply(_proposalId: Bytes): BigInt {
    let result = super.call(
      "getTotalReputationSupply",
      "getTotalReputationSupply(bytes32):(uint256)",
      [ethereum.Value.fromFixedBytes(_proposalId)]
    );

    return result[0].toBigInt();
  }

  try_getTotalReputationSupply(
    _proposalId: Bytes
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getTotalReputationSupply",
      "getTotalReputationSupply(bytes32):(uint256)",
      [ethereum.Value.fromFixedBytes(_proposalId)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  mintReputation(
    _amount: BigInt,
    _beneficiary: Address,
    _proposalId: Bytes
  ): boolean {
    let result = super.call(
      "mintReputation",
      "mintReputation(uint256,address,bytes32):(bool)",
      [
        ethereum.Value.fromUnsignedBigInt(_amount),
        ethereum.Value.fromAddress(_beneficiary),
        ethereum.Value.fromFixedBytes(_proposalId)
      ]
    );

    return result[0].toBoolean();
  }

  try_mintReputation(
    _amount: BigInt,
    _beneficiary: Address,
    _proposalId: Bytes
  ): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "mintReputation",
      "mintReputation(uint256,address,bytes32):(bool)",
      [
        ethereum.Value.fromUnsignedBigInt(_amount),
        ethereum.Value.fromAddress(_beneficiary),
        ethereum.Value.fromFixedBytes(_proposalId)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  organizationsProposals(
    param0: Address,
    param1: Bytes
  ): Contract__organizationsProposalsResult {
    let result = super.call(
      "organizationsProposals",
      "organizationsProposals(address,bytes32):(uint256,address,uint256,address,uint256,uint256,uint256)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromFixedBytes(param1)
      ]
    );

    return new Contract__organizationsProposalsResult(
      result[0].toBigInt(),
      result[1].toAddress(),
      result[2].toBigInt(),
      result[3].toAddress(),
      result[4].toBigInt(),
      result[5].toBigInt(),
      result[6].toBigInt()
    );
  }

  try_organizationsProposals(
    param0: Address,
    param1: Bytes
  ): ethereum.CallResult<Contract__organizationsProposalsResult> {
    let result = super.tryCall(
      "organizationsProposals",
      "organizationsProposals(address,bytes32):(uint256,address,uint256,address,uint256,uint256,uint256)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromFixedBytes(param1)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Contract__organizationsProposalsResult(
        value[0].toBigInt(),
        value[1].toAddress(),
        value[2].toBigInt(),
        value[3].toAddress(),
        value[4].toBigInt(),
        value[5].toBigInt(),
        value[6].toBigInt()
      )
    );
  }

  parameters(param0: Bytes): Contract__parametersResult {
    let result = super.call(
      "parameters",
      "parameters(bytes32):(bytes32,address)",
      [ethereum.Value.fromFixedBytes(param0)]
    );

    return new Contract__parametersResult(
      result[0].toBytes(),
      result[1].toAddress()
    );
  }

  try_parameters(
    param0: Bytes
  ): ethereum.CallResult<Contract__parametersResult> {
    let result = super.tryCall(
      "parameters",
      "parameters(bytes32):(bytes32,address)",
      [ethereum.Value.fromFixedBytes(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Contract__parametersResult(value[0].toBytes(), value[1].toAddress())
    );
  }

  proposalsInfo(param0: Address, param1: Bytes): Contract__proposalsInfoResult {
    let result = super.call(
      "proposalsInfo",
      "proposalsInfo(address,bytes32):(uint256,address)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromFixedBytes(param1)
      ]
    );

    return new Contract__proposalsInfoResult(
      result[0].toBigInt(),
      result[1].toAddress()
    );
  }

  try_proposalsInfo(
    param0: Address,
    param1: Bytes
  ): ethereum.CallResult<Contract__proposalsInfoResult> {
    let result = super.tryCall(
      "proposalsInfo",
      "proposalsInfo(address,bytes32):(uint256,address)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromFixedBytes(param1)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Contract__proposalsInfoResult(
        value[0].toBigInt(),
        value[1].toAddress()
      )
    );
  }

  reputationOf(_owner: Address, _proposalId: Bytes): BigInt {
    let result = super.call(
      "reputationOf",
      "reputationOf(address,bytes32):(uint256)",
      [
        ethereum.Value.fromAddress(_owner),
        ethereum.Value.fromFixedBytes(_proposalId)
      ]
    );

    return result[0].toBigInt();
  }

  try_reputationOf(
    _owner: Address,
    _proposalId: Bytes
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "reputationOf",
      "reputationOf(address,bytes32):(uint256)",
      [
        ethereum.Value.fromAddress(_owner),
        ethereum.Value.fromFixedBytes(_proposalId)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  stakingTokenTransfer(
    _stakingToken: Address,
    _beneficiary: Address,
    _amount: BigInt,
    _proposalId: Bytes
  ): boolean {
    let result = super.call(
      "stakingTokenTransfer",
      "stakingTokenTransfer(address,address,uint256,bytes32):(bool)",
      [
        ethereum.Value.fromAddress(_stakingToken),
        ethereum.Value.fromAddress(_beneficiary),
        ethereum.Value.fromUnsignedBigInt(_amount),
        ethereum.Value.fromFixedBytes(_proposalId)
      ]
    );

    return result[0].toBoolean();
  }

  try_stakingTokenTransfer(
    _stakingToken: Address,
    _beneficiary: Address,
    _amount: BigInt,
    _proposalId: Bytes
  ): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "stakingTokenTransfer",
      "stakingTokenTransfer(address,address,uint256,bytes32):(bool)",
      [
        ethereum.Value.fromAddress(_stakingToken),
        ethereum.Value.fromAddress(_beneficiary),
        ethereum.Value.fromUnsignedBigInt(_amount),
        ethereum.Value.fromFixedBytes(_proposalId)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  executeProposal(_proposalId: Bytes, _param: BigInt): boolean {
    let result = super.call(
      "executeProposal",
      "executeProposal(bytes32,int256):(bool)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromSignedBigInt(_param)
      ]
    );

    return result[0].toBoolean();
  }

  try_executeProposal(
    _proposalId: Bytes,
    _param: BigInt
  ): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "executeProposal",
      "executeProposal(bytes32,int256):(bool)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromSignedBigInt(_param)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  setParameters(_voteApproveParams: Bytes, _intVote: Address): Bytes {
    let result = super.call(
      "setParameters",
      "setParameters(bytes32,address):(bytes32)",
      [
        ethereum.Value.fromFixedBytes(_voteApproveParams),
        ethereum.Value.fromAddress(_intVote)
      ]
    );

    return result[0].toBytes();
  }

  try_setParameters(
    _voteApproveParams: Bytes,
    _intVote: Address
  ): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "setParameters",
      "setParameters(bytes32,address):(bytes32)",
      [
        ethereum.Value.fromFixedBytes(_voteApproveParams),
        ethereum.Value.fromAddress(_intVote)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  proposeContributionReward(
    _avatar: Address,
    _descriptionHash: string,
    param2: BigInt,
    _rewards: Array<BigInt>,
    _externalToken: Address,
    _beneficiary: Address
  ): Bytes {
    let result = super.call(
      "proposeContributionReward",
      "proposeContributionReward(address,string,int256,uint256[5],address,address):(bytes32)",
      [
        ethereum.Value.fromAddress(_avatar),
        ethereum.Value.fromString(_descriptionHash),
        ethereum.Value.fromSignedBigInt(param2),
        ethereum.Value.fromUnsignedBigIntArray(_rewards),
        ethereum.Value.fromAddress(_externalToken),
        ethereum.Value.fromAddress(_beneficiary)
      ]
    );

    return result[0].toBytes();
  }

  try_proposeContributionReward(
    _avatar: Address,
    _descriptionHash: string,
    param2: BigInt,
    _rewards: Array<BigInt>,
    _externalToken: Address,
    _beneficiary: Address
  ): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "proposeContributionReward",
      "proposeContributionReward(address,string,int256,uint256[5],address,address):(bytes32)",
      [
        ethereum.Value.fromAddress(_avatar),
        ethereum.Value.fromString(_descriptionHash),
        ethereum.Value.fromSignedBigInt(param2),
        ethereum.Value.fromUnsignedBigIntArray(_rewards),
        ethereum.Value.fromAddress(_externalToken),
        ethereum.Value.fromAddress(_beneficiary)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  redeemEther(_proposalId: Bytes, _avatar: Address): BigInt {
    let result = super.call(
      "redeemEther",
      "redeemEther(bytes32,address):(uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar)
      ]
    );

    return result[0].toBigInt();
  }

  try_redeemEther(
    _proposalId: Bytes,
    _avatar: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "redeemEther",
      "redeemEther(bytes32,address):(uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  redeemExternalToken(_proposalId: Bytes, _avatar: Address): BigInt {
    let result = super.call(
      "redeemExternalToken",
      "redeemExternalToken(bytes32,address):(uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar)
      ]
    );

    return result[0].toBigInt();
  }

  try_redeemExternalToken(
    _proposalId: Bytes,
    _avatar: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "redeemExternalToken",
      "redeemExternalToken(bytes32,address):(uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  redeem(
    _proposalId: Bytes,
    _avatar: Address,
    _whatToRedeem: Array<boolean>
  ): Contract__redeemResult {
    let result = super.call(
      "redeem",
      "redeem(bytes32,address,bool[4]):(uint256,uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar),
        ethereum.Value.fromBooleanArray(_whatToRedeem)
      ]
    );

    return new Contract__redeemResult(
      result[0].toBigInt(),
      result[1].toBigInt()
    );
  }

  try_redeem(
    _proposalId: Bytes,
    _avatar: Address,
    _whatToRedeem: Array<boolean>
  ): ethereum.CallResult<Contract__redeemResult> {
    let result = super.tryCall(
      "redeem",
      "redeem(bytes32,address,bool[4]):(uint256,uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar),
        ethereum.Value.fromBooleanArray(_whatToRedeem)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Contract__redeemResult(value[0].toBigInt(), value[1].toBigInt())
    );
  }

  getPeriodsToPay(
    _proposalId: Bytes,
    _avatar: Address,
    _redeemType: BigInt
  ): BigInt {
    let result = super.call(
      "getPeriodsToPay",
      "getPeriodsToPay(bytes32,address,uint256):(uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar),
        ethereum.Value.fromUnsignedBigInt(_redeemType)
      ]
    );

    return result[0].toBigInt();
  }

  try_getPeriodsToPay(
    _proposalId: Bytes,
    _avatar: Address,
    _redeemType: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getPeriodsToPay",
      "getPeriodsToPay(bytes32,address,uint256):(uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar),
        ethereum.Value.fromUnsignedBigInt(_redeemType)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getRedeemedPeriods(
    _proposalId: Bytes,
    _avatar: Address,
    _redeemType: BigInt
  ): BigInt {
    let result = super.call(
      "getRedeemedPeriods",
      "getRedeemedPeriods(bytes32,address,uint256):(uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar),
        ethereum.Value.fromUnsignedBigInt(_redeemType)
      ]
    );

    return result[0].toBigInt();
  }

  try_getRedeemedPeriods(
    _proposalId: Bytes,
    _avatar: Address,
    _redeemType: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getRedeemedPeriods",
      "getRedeemedPeriods(bytes32,address,uint256):(uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar),
        ethereum.Value.fromUnsignedBigInt(_redeemType)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getProposalEthReward(_proposalId: Bytes, _avatar: Address): BigInt {
    let result = super.call(
      "getProposalEthReward",
      "getProposalEthReward(bytes32,address):(uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar)
      ]
    );

    return result[0].toBigInt();
  }

  try_getProposalEthReward(
    _proposalId: Bytes,
    _avatar: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getProposalEthReward",
      "getProposalEthReward(bytes32,address):(uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getProposalExternalTokenReward(_proposalId: Bytes, _avatar: Address): BigInt {
    let result = super.call(
      "getProposalExternalTokenReward",
      "getProposalExternalTokenReward(bytes32,address):(uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar)
      ]
    );

    return result[0].toBigInt();
  }

  try_getProposalExternalTokenReward(
    _proposalId: Bytes,
    _avatar: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getProposalExternalTokenReward",
      "getProposalExternalTokenReward(bytes32,address):(uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getProposalExternalToken(_proposalId: Bytes, _avatar: Address): Address {
    let result = super.call(
      "getProposalExternalToken",
      "getProposalExternalToken(bytes32,address):(address)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar)
      ]
    );

    return result[0].toAddress();
  }

  try_getProposalExternalToken(
    _proposalId: Bytes,
    _avatar: Address
  ): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "getProposalExternalToken",
      "getProposalExternalToken(bytes32,address):(address)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getProposalExecutionTime(_proposalId: Bytes, _avatar: Address): BigInt {
    let result = super.call(
      "getProposalExecutionTime",
      "getProposalExecutionTime(bytes32,address):(uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar)
      ]
    );

    return result[0].toBigInt();
  }

  try_getProposalExecutionTime(
    _proposalId: Bytes,
    _avatar: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getProposalExecutionTime",
      "getProposalExecutionTime(bytes32,address):(uint256)",
      [
        ethereum.Value.fromFixedBytes(_proposalId),
        ethereum.Value.fromAddress(_avatar)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getParametersHash(_voteApproveParams: Bytes, _intVote: Address): Bytes {
    let result = super.call(
      "getParametersHash",
      "getParametersHash(bytes32,address):(bytes32)",
      [
        ethereum.Value.fromFixedBytes(_voteApproveParams),
        ethereum.Value.fromAddress(_intVote)
      ]
    );

    return result[0].toBytes();
  }

  try_getParametersHash(
    _voteApproveParams: Bytes,
    _intVote: Address
  ): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "getParametersHash",
      "getParametersHash(bytes32,address):(bytes32)",
      [
        ethereum.Value.fromFixedBytes(_voteApproveParams),
        ethereum.Value.fromAddress(_intVote)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }
}

export class BurnReputationCall extends ethereum.Call {
  get inputs(): BurnReputationCall__Inputs {
    return new BurnReputationCall__Inputs(this);
  }

  get outputs(): BurnReputationCall__Outputs {
    return new BurnReputationCall__Outputs(this);
  }
}

export class BurnReputationCall__Inputs {
  _call: BurnReputationCall;

  constructor(call: BurnReputationCall) {
    this._call = call;
  }

  get _amount(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get _beneficiary(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _proposalId(): Bytes {
    return this._call.inputValues[2].value.toBytes();
  }
}

export class BurnReputationCall__Outputs {
  _call: BurnReputationCall;

  constructor(call: BurnReputationCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class MintReputationCall extends ethereum.Call {
  get inputs(): MintReputationCall__Inputs {
    return new MintReputationCall__Inputs(this);
  }

  get outputs(): MintReputationCall__Outputs {
    return new MintReputationCall__Outputs(this);
  }
}

export class MintReputationCall__Inputs {
  _call: MintReputationCall;

  constructor(call: MintReputationCall) {
    this._call = call;
  }

  get _amount(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get _beneficiary(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _proposalId(): Bytes {
    return this._call.inputValues[2].value.toBytes();
  }
}

export class MintReputationCall__Outputs {
  _call: MintReputationCall;

  constructor(call: MintReputationCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class StakingTokenTransferCall extends ethereum.Call {
  get inputs(): StakingTokenTransferCall__Inputs {
    return new StakingTokenTransferCall__Inputs(this);
  }

  get outputs(): StakingTokenTransferCall__Outputs {
    return new StakingTokenTransferCall__Outputs(this);
  }
}

export class StakingTokenTransferCall__Inputs {
  _call: StakingTokenTransferCall;

  constructor(call: StakingTokenTransferCall) {
    this._call = call;
  }

  get _stakingToken(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _beneficiary(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _amount(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get _proposalId(): Bytes {
    return this._call.inputValues[3].value.toBytes();
  }
}

export class StakingTokenTransferCall__Outputs {
  _call: StakingTokenTransferCall;

  constructor(call: StakingTokenTransferCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class ExecuteProposalCall extends ethereum.Call {
  get inputs(): ExecuteProposalCall__Inputs {
    return new ExecuteProposalCall__Inputs(this);
  }

  get outputs(): ExecuteProposalCall__Outputs {
    return new ExecuteProposalCall__Outputs(this);
  }
}

export class ExecuteProposalCall__Inputs {
  _call: ExecuteProposalCall;

  constructor(call: ExecuteProposalCall) {
    this._call = call;
  }

  get _proposalId(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _param(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class ExecuteProposalCall__Outputs {
  _call: ExecuteProposalCall;

  constructor(call: ExecuteProposalCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class SetParametersCall extends ethereum.Call {
  get inputs(): SetParametersCall__Inputs {
    return new SetParametersCall__Inputs(this);
  }

  get outputs(): SetParametersCall__Outputs {
    return new SetParametersCall__Outputs(this);
  }
}

export class SetParametersCall__Inputs {
  _call: SetParametersCall;

  constructor(call: SetParametersCall) {
    this._call = call;
  }

  get _voteApproveParams(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _intVote(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class SetParametersCall__Outputs {
  _call: SetParametersCall;

  constructor(call: SetParametersCall) {
    this._call = call;
  }

  get value0(): Bytes {
    return this._call.outputValues[0].value.toBytes();
  }
}

export class ProposeContributionRewardCall extends ethereum.Call {
  get inputs(): ProposeContributionRewardCall__Inputs {
    return new ProposeContributionRewardCall__Inputs(this);
  }

  get outputs(): ProposeContributionRewardCall__Outputs {
    return new ProposeContributionRewardCall__Outputs(this);
  }
}

export class ProposeContributionRewardCall__Inputs {
  _call: ProposeContributionRewardCall;

  constructor(call: ProposeContributionRewardCall) {
    this._call = call;
  }

  get _avatar(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _descriptionHash(): string {
    return this._call.inputValues[1].value.toString();
  }

  get value2(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get _rewards(): Array<BigInt> {
    return this._call.inputValues[3].value.toBigIntArray();
  }

  get _externalToken(): Address {
    return this._call.inputValues[4].value.toAddress();
  }

  get _beneficiary(): Address {
    return this._call.inputValues[5].value.toAddress();
  }
}

export class ProposeContributionRewardCall__Outputs {
  _call: ProposeContributionRewardCall;

  constructor(call: ProposeContributionRewardCall) {
    this._call = call;
  }

  get value0(): Bytes {
    return this._call.outputValues[0].value.toBytes();
  }
}

export class RedeemEtherCall extends ethereum.Call {
  get inputs(): RedeemEtherCall__Inputs {
    return new RedeemEtherCall__Inputs(this);
  }

  get outputs(): RedeemEtherCall__Outputs {
    return new RedeemEtherCall__Outputs(this);
  }
}

export class RedeemEtherCall__Inputs {
  _call: RedeemEtherCall;

  constructor(call: RedeemEtherCall) {
    this._call = call;
  }

  get _proposalId(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _avatar(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class RedeemEtherCall__Outputs {
  _call: RedeemEtherCall;

  constructor(call: RedeemEtherCall) {
    this._call = call;
  }

  get amount(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class RedeemExternalTokenCall extends ethereum.Call {
  get inputs(): RedeemExternalTokenCall__Inputs {
    return new RedeemExternalTokenCall__Inputs(this);
  }

  get outputs(): RedeemExternalTokenCall__Outputs {
    return new RedeemExternalTokenCall__Outputs(this);
  }
}

export class RedeemExternalTokenCall__Inputs {
  _call: RedeemExternalTokenCall;

  constructor(call: RedeemExternalTokenCall) {
    this._call = call;
  }

  get _proposalId(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _avatar(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class RedeemExternalTokenCall__Outputs {
  _call: RedeemExternalTokenCall;

  constructor(call: RedeemExternalTokenCall) {
    this._call = call;
  }

  get amount(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class RedeemCall extends ethereum.Call {
  get inputs(): RedeemCall__Inputs {
    return new RedeemCall__Inputs(this);
  }

  get outputs(): RedeemCall__Outputs {
    return new RedeemCall__Outputs(this);
  }
}

export class RedeemCall__Inputs {
  _call: RedeemCall;

  constructor(call: RedeemCall) {
    this._call = call;
  }

  get _proposalId(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _avatar(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _whatToRedeem(): Array<boolean> {
    return this._call.inputValues[2].value.toBooleanArray();
  }
}

export class RedeemCall__Outputs {
  _call: RedeemCall;

  constructor(call: RedeemCall) {
    this._call = call;
  }

  get etherReward(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }

  get externalTokenReward(): BigInt {
    return this._call.outputValues[1].value.toBigInt();
  }
}
