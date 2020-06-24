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

    uint256 public decimals = 18;

    event UpdateListingFee(uint256 indexed timestamp, uint256 indexed newValue);
    event UpdateTransactionFee(
        uint256 indexed timestamp,
        uint256 indexed newValue
    );
    event UpdateValidationFee(
        uint256 indexed timestamp,
        uint256 indexed newValue
    );
    event UpdateMembershipFee(
        uint256 indexed timestamp,
        uint256 indexed newValue
    );

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

    /**
     * @dev set new listing fee value.
     * @param _listingFee new listing fee value
     */
    function setListingFee(uint256 _listingFee) public onlyOwner {
        listingFee = _listingFee;
        emit UpdateListingFee(now, _listingFee);
    }

    /**
     * @dev set new transaction fee value.
     * @param _transactionFee new transaction fee value
     */
    function setTransactionFee(uint256 _transactionFee) public onlyOwner {
        transactionFee = _transactionFee;
        emit UpdateTransactionFee(now, _transactionFee);
    }

    /**
     * @dev set new validation fee value.
     * @param _validationFee new validation fee value
     */
    function setValidationFee(uint256 _validationFee) public onlyOwner {
        validationFee = _validationFee;
        emit UpdateValidationFee(now, _validationFee);
    }

    /**
     * @dev set new membership fee value.
     * @param _membershipFee new membership fee value, can't be non-integer, given the decimals
     */
    function setMembershipFee(uint256 _membershipFee) public onlyOwner {
        require(
            _membershipFee % 1 ether == 0,
            "Passed non-integer value to membership fee. It must be integer, given the decimals."
        );
        membershipFee = _membershipFee;
        emit UpdateMembershipFee(now, _membershipFee);
    }

    /**
     * @dev set new value for all fees.
     * @param _listingFee new listing fee value
     * @param _transactionFee new transaction fee value
     * @param _validationFee new validation fee value
     * @param _membershipFee new membership fee value, can't be non-integer, given the decimals
     */
    function setFees(
        uint256 _listingFee,
        uint256 _transactionFee,
        uint256 _validationFee,
        uint256 _membershipFee
    ) public onlyOwner {
        require(
            _membershipFee % 1 ether == 0,
            "Passed non-integer value to membership fee. It must be integer, given the decimals."
        );
        listingFee = _listingFee;
        transactionFee = _transactionFee;
        validationFee = _validationFee;
        membershipFee = _membershipFee;
        emit UpdateListingFee(now, _listingFee);
        emit UpdateTransactionFee(now, _transactionFee);
        emit UpdateValidationFee(now, _validationFee);
        emit UpdateMembershipFee(now, _membershipFee);
    }
}
