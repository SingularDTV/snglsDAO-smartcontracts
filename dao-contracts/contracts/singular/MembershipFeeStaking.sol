pragma solidity 0.5.13;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


/**
 * @title A locker contract
 */

contract MembershipFeeStaking {
    using SafeMath for uint256;

    event Release(address indexed _beneficiary, uint256 _amount);
    event Lock(address indexed sender, uint256 _amount, uint256 _period);

    struct Locker {
        uint256 amount;
        uint256 releaseTime;
    }

    IERC20 public sgtToken;

    // A mapping from lockers addresses their lock balances.
    mapping(address => Locker) public lockers;

    uint256 public totalLocked;
    uint256 public minLockingPeriod;

    /**
     * @dev getter for locker's locked tokens
     */

    /**
     * @dev release function
     * @param _beneficiary the beneficiary for the release
     * @return bool
     */
    function release(address _beneficiary) public returns (uint256 amount) {
        Locker storage locker = lockers[_beneficiary];
        require(
            locker.amount > 0,
            "MembershipFeeStaking: amount should be > 0"
        );
        amount = locker.amount;
        locker.amount = 0;
        // solhint-disable-next-line not-rely-on-time
        require(
            block.timestamp >= locker.releaseTime,
            "MembershipFeeStaking: check the lock period pass"
        );
        require(
            sgtToken.transfer(_beneficiary, amount),
            "MembershipFeeStaking: can't transfer tokens to staking address"
        );
        emit Release(_beneficiary, amount);
    }

    /**
     * @dev lock function
     * @param _amount the amount to lock
     * @param _period the locking period
     * @return bool
     */

    function lock(uint256 _amount, uint256 _period) public {
        require(
            _amount > 0,
            "MembershipFeeStaking: locking amount should be > 0"
        );
        require(
            _period >= minLockingPeriod,
            "MembershipFeeStaking: locking period should be >= minLockingPeriod"
        );
        require(
            sgtToken.transferFrom(msg.sender, address(this), _amount),
            "MembershipFeeStaking: can't transfer tokens to staking address"
        );

        Locker storage locker = lockers[msg.sender];
        locker.amount = _amount;

        // solhint-disable-next-line not-rely-on-time
        locker.releaseTime = now + _period;

        totalLocked = totalLocked.add(_amount);
        emit Lock(msg.sender, _amount, _period);
    }

    /**
     * @dev initialize
     * @param _sgtToken the SGT token address to stake on
     * @param _minLockingPeriod minimum locking period allowed.
     */
    function initialize(IERC20 _sgtToken, uint256 _minLockingPeriod) public {
        require(sgtToken == IERC20(0), "can be called only one time");
        require(_sgtToken != IERC20(0), "token cannot be zero");

        minLockingPeriod = _minLockingPeriod;
        sgtToken = _sgtToken;
    }
}

// pragma solidity ^0.5.0;

// import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
// import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// contract MembershipFeeStaking {
//     using SafeMath for uint256;
//     IERC20 public token;
//     mapping(address => uint256) public balances;

//     constructor(IERC20 _token) public {
//         token = _token;
//     }

//     function stake(uint256 _amount) public returns (bool) {
//         require(
//             token.transferFrom(msg.sender, address(this), _amount),
//             "MembershipFeeStaking: Can't transfer tokens to staking address"
//         );
//         balances[msg.sender] = balances[msg.sender].add(_amount);
//         return true;
//     }

//     function balanceOf(address _account) public view returns (uint256) {
//         return balances[_account];
//     }
// }
