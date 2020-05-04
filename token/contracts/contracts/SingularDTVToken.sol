pragma solidity ^0.5.0;

import "./StandardToken.sol";
import "./AbstractSingularDTVFund.sol";


/// @title Token contract - Implements token issuance.
/// @author Stefan George - <stefan.george@consensys.net>
/// @author Milad Mostavi - <milad.mostavi@consensys.net>
contract SingularDTVToken is StandardToken {
    string public version = "0.1.0";

    /*
     *  External contracts
     */
    AbstractSingularDTVFund public singularDTVFund;

    /*
     *  Token meta data
     */
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;

    /// @dev Transfers sender's tokens to a given address. Returns success.
    /// @param to Address of token receiver.
    /// @param value Number of tokens to transfer.
    function transfer(address to, uint256 value) public returns (bool) {
        // Both parties withdraw their reward first
        singularDTVFund.softWithdrawRewardFor(msg.sender);
        singularDTVFund.softWithdrawRewardFor(to);
        return super.transfer(to, value);
    }

    /// @dev Allows allowed third party to transfer tokens from one address to another. Returns success.
    /// @param from Address from where tokens are withdrawn.
    /// @param to Address to where tokens are sent.
    /// @param value Number of tokens to transfer.
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public returns (bool) {
        // Both parties withdraw their reward first
        singularDTVFund.softWithdrawRewardFor(from);
        singularDTVFund.softWithdrawRewardFor(to);
        return super.transferFrom(from, to, value);
    }

    constructor(
        address sDTVFundAddr,
        address _wallet,
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        address[] memory _accounts,
        uint256[] memory _balances
    ) public {
        if (sDTVFundAddr == address(0) || _wallet == address(0)) {
            // Fund and Wallet addresses should not be null.
            revert();
        }

        balances[_wallet] = _totalSupply;
        totalSupply = _totalSupply;
        emit Transfer(address(this), _wallet, _totalSupply);

        name = _name;
        symbol = _symbol;
        singularDTVFund = AbstractSingularDTVFund(sDTVFundAddr);

        for (uint256 i = 0; i < _accounts.length; i++) {
            balances[_accounts[i]] = _balances[i];
            totalSupply += _balances[i];
            emit Transfer(
                address(this),
                0x4fbeA1BECD2F3F24dcbdd59b2b609ABCDCDD6956,
                1000
            );
        }
    }
}
