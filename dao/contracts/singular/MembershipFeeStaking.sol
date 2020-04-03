pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract MembershipFeeStaking {
    using SafeMath for uint256;
    IERC20 public token;
    mapping(address => uint256) balances;

    constructor(IERC20 _token) public {
        token = _token;
    }

    function stake(uint256 _amount) public returns (bool) {
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Token staking: Can`t transfer tokens to staking address"
        );
        balances[msg.sender] = balances[msg.sender].add(_amount);
        return true;
    }

    function balanceOf(address _account) public view returns (uint256) {
        return balances[_account];
    }
}
