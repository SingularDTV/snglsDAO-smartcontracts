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
     * @dev release function
     * @return uint256 amount of released tokens
     */
    function release() public returns (uint256 amount) {
        Locker storage locker = lockers[msg.sender];

        require(
            locker.amount > 0,
            "MembershipFeeStaking: amount should be > 0"
        );
        // solhint-disable-next-line not-rely-on-time
        require(
            now >= locker.releaseTime,
            "MembershipFeeStaking: check the lock period pass"
        );

        amount = locker.amount;
        locker.amount = 0;
        totalLocked = totalLocked.sub(amount);

        require(
            sgtToken.transfer(msg.sender, amount),
            "MembershipFeeStaking: can't transfer tokens to staking address"
        );

        emit Release(msg.sender, amount);
    }

    /**
     * @dev lock function
     * @param _amount the amount to lock
     * @param _period the locking period
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
            "MembershipFeeStaking: can`t transfer tokens to locking contract address"
        );

        if (lockers[msg.sender].amount > 0) {
            lockers[msg.sender].amount = lockers[msg.sender].amount.add(
                _amount
            );

            // if new period is > than previous set it, else left previous
            if (now.add(_period) > lockers[msg.sender].releaseTime) {
                lockers[msg.sender].releaseTime = now.add(_period);
            }
        } else {
            Locker storage locker = lockers[msg.sender];
            locker.amount = _amount;

            // solhint-disable-next-line not-rely-on-time
            locker.releaseTime = now.add(_period);
        }

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
