# Contracts Description
## DAO core
| Contract name | Description |
|--|--|
| Avatar | The "face" of the DAO, this contract makes calls to external contracts, keeps ETH and tokens (treasury). |
| Controller | Main DAO contract. It controls reputation, (un)registers schemes and global constraints and can send generic call for execution to Avatar contract. |
| Reputation | This contract represents reputation balances and handles reputation minting and burning. Reputation is like ERC20 but can't be transferred. |

## Schemes
| Contract | Description |
|--|--|
| ContributionReward | Can be used to create a new proposal for funding, e.g. proposal to transfer ETH to developer command which want to upgrade DAO. This proposal will be executed if DAO members   vote for it. **Note:** Singularity DAO uses custom version of this contract, you can find it on GitHub. It has disabled native token and reputation minting functionality, only ETH and token transfers can be used as reward. |
| LockingSGT4Reputation | This contract is used to get reputation in the way of locking DAO native token - SGT. User's reputation always equals to the amount of locked SGT tokens. |
| SchemeRegistrar | This one can be used to create proposals for adding new scheme to DAO.|
| UGenericScheme | Predeployed/external scheme for creating proposals for making generic call to specific contract. In Singularity DAO this contract is used to change protocol parameters. |

## Voting
| Contract | Description |
|--|--|
| GenesisProtocol | Voting contract, which handles creating new proposals, boosting, voting and proposal execution. |


## Standalone contracts
| Contract | Description |
|--|--|
| MembershipFeeStaking | SNGL token staking contract. Used for protocol membership. |
| Fee | This contract is used to store and modify protocol fees parameters. Fees can be changed in a way of creating proposal in UGenericScheme and voting for it in GenesisProtocol (GenesisProtocol described below). |

## Tokens
| Token | Description |
|--|--|
| snglsDAO (SGT) | DAO token. Used for getting reputation. Was airdropped from SNGLS token. |
| SingularDTV (SNGLS) | In DAO used for protocol membership. |


