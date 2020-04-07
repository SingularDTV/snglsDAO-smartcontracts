pragma solidity ^0.5.0;

import "./PriceOracleInterface.sol";


contract TokenLockingOracle is PriceOracleInterface {
    address token;

    constructor(address _token) public {
        token = _token;
    }

    function getPrice(address _token) external view returns (uint256, uint256) {
        require(token == _token, "Invalid token address");
        return (1, 1);
    }
}
