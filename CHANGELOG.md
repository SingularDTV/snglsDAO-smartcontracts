# Changelog

## [1.0.7] - 2020-05-18

### Changed

- Changed the functionality of staking in MembershipFee contract
- Сhanged the principle of distribution of reputation in the scheme of issuing reputation

## [1.0.6] - 2020-05-06

### Added

- Pulling commission information from contracts
- Blocks with information about commissions

### Changed

- General page style
- Fixed bug in the functionality of creating new offers

## [1.0.5] - 2020-04-28

### Added

- Dashboard page added

### Changed

- Application routing rules changed

## [1.0.4] - 2020-04-21

### Added

- Added reputation contract in migration script

### Changed

- DAO opening immediately in a detailed form

## [1.0.3] - 2020-04-06

### Added

- DAO configuration file.
- Scenario of migration of DAO to a private network.
- Description of migration error prevention in README.

### Changed

- Alchemy web application 10.3
- Migrations using standard DAOstack tools

## [1.0.2] - 2020-03-26

### Added

- Basic DAO contracts.
- Absolute majority vote contract added.
- Contract for freezing tokens (any ERC20 currently).
- Global constrains contract.
- Proposal voting test script.
- Configured contracts list:    

Part                | Contract name
-------------       | -------------
 DAO core           | Avatar
 _                  | Controller
 _                  | DAOToken
 _                  | Reputation
 Voting             | AbsoluteVote
 _                  | VotingMachineCallbacks
 Schemes            | Agreement
 _                  | ContributionRewardExt
 _                  | Locking4Reputation
 _                  | LockingToken4Reputation
Global constraints  | TokenCapGC






### Changed

- SingularDTVFund contract now can deposit and withdraw rewards in ERC20 tokens. Tokens must be allowed by owner to 

## [1.0.1] - 2020-03-17

### Added

- Airdrop script with tests for it.
- SGToken contract.
- ERC20 token for tests.

### Changed

- SingularDTVFund contract now can deposit and withdraw rewards in ERC20 tokens. Tokens must be allowed by owner to 