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
    function transferFrom(address from, address to, uint256 value)
        public
        returns (bool)
    {
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
        uint256 _totalSupply
    ) public {
        if (sDTVFundAddr == address(0) || _wallet == address(0)) {
            // Fund and Wallet addresses should not be null.
            revert();
        }

        balances[_wallet] = _totalSupply;
        totalSupply = _totalSupply;

        name = _name;
        symbol = _symbol;

        balances[0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1] = 1000;
        balances[0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0] = 900;
        balances[0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b] = 800;
        balances[0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d] = 700;
        balances[0xd03ea8624C8C5987235048901fB614fDcA89b117] = 600;
        balances[0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC] = 500;
        balances[0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9] = 400;
        balances[0x28a8746e75304c0780E011BEd21C72cD78cd535E] = 300;
        balances[0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E] = 200;
        balances[0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e] = 100;
        totalSupply+=5500;

        singularDTVFund = AbstractSingularDTVFund(sDTVFundAddr);

        emit Transfer(address(this), _wallet, _totalSupply);

        emit Transfer(address(this), 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1, 1000);
        emit Transfer(address(this), 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0, 900);
        emit Transfer(address(this), 0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b, 800);
        emit Transfer(address(this), 0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d, 700);
        emit Transfer(address(this), 0xd03ea8624C8C5987235048901fB614fDcA89b117, 600);
        emit Transfer(address(this), 0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC, 500);
        emit Transfer(address(this), 0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9, 400);
        emit Transfer(address(this), 0x28a8746e75304c0780E011BEd21C72cD78cd535E, 300);
        emit Transfer(address(this), 0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E, 200);
        emit Transfer(address(this), 0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e, 100);
    }
}
