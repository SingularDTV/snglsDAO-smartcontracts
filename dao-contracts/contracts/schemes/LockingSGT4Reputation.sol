pragma solidity 0.5.13;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../controller/Controller.sol";


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
    Avatar avatar;
    IERC20 public sgtToken;

    // A mapping from lockers addresses their lock balances.
    mapping(address => Locker) public lockers;

    uint256 public totalLocked;
    uint256 public minLockingPeriod;

    /**
     * @dev release function
     * @param _beneficiary the beneficiary for the release
     * @return bool
     */
    function release(address _beneficiary) public returns (uint256 amount) {
        Locker storage locker = lockers[_beneficiary];

        require(
            locker.amount > 0,
            "LockingSGT4Reputation: amount should be > 0"
        );
        // solhint-disable-next-line not-rely-on-time
        require(
            now >= locker.releaseTime,
            "LockingSGT4Reputation: check the lock period pass"
        );

        amount = locker.amount;
        locker.amount = 0;

        require(
            Controller(avatar.owner()).burnReputation(
                amount,
                _beneficiary,
                address(avatar)
            ),
            "LockingSGT4Reputation:burn reputation should succeed"
        );
        require(
            sgtToken.transfer(_beneficiary, amount),
            "LockingSGT4Reputation: can't transfer tokens to staking address"
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
            "LockingSGT4Reputation: locking amount should be > 0"
        );
        require(
            _period >= minLockingPeriod,
            "LockingSGT4Reputation: locking period should be >= minLockingPeriod"
        );
        require(
            sgtToken.transferFrom(msg.sender, address(this), _amount),
            "LockingSGT4Reputation: can`t transfer tokens to locking contract address"
        );
        require(
            Controller(avatar.owner()).mintReputation(
                _amount,
                msg.sender,
                address(avatar)
            ),
            "mint reputation should succeed"
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
    function initialize(
        Avatar _avatar,
        IERC20 _sgtToken,
        uint256 _minLockingPeriod
    ) public {
        require(sgtToken == IERC20(0), "can be called only one time");
        require(_sgtToken != IERC20(0), "token cannot be zero");
        avatar = _avatar;
        minLockingPeriod = _minLockingPeriod;
        sgtToken = _sgtToken;
    }
}
