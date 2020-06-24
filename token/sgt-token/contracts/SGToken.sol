pragma solidity ^0.6.10;

    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SGToken is ERC20 {
    constructor() ERC20("snglsDAO Governance Token", "SGT") public {
        // _mint(0x4fbeA1BECD2F3F24dcbdd59b2b609ABCDCDD6956, 1000000000000000000000000000);
        _mint(0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1, 1000000000000000000000000000);

    }
}