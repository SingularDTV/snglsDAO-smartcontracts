pragma solidity >=0.5.13;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title Fee contract
 * @dev This contract contains fees for Singular DTV platform.
 */
contract Fee is Ownable {
    uint256 public listingFee;
    uint256 public transactionFee;
    uint256 public validationFee;
    uint256 public membershipFee;

    constructor(
        uint256 _listingFee,
        uint256 _transactionFee,
        uint256 _validationFee,
        uint256 _membershipFee
    ) public {
        listingFee = _listingFee;
        transactionFee = _transactionFee;
        validationFee = _validationFee;
        membershipFee = _membershipFee;
    }

    function setListingFee(uint256 _listingFee) public onlyOwner {
        listingFee = _listingFee;
    }

    function setTransactionFee(uint256 _transactionFee) public onlyOwner {
        transactionFee = _transactionFee;
    }

    function setValidationFee(uint256 _validationFee) public onlyOwner {
        validationFee = _validationFee;
    }

    function setMembershipFee(uint256 _membershipFee) public onlyOwner {
        membershipFee = _membershipFee;
    }
}
