pragma solidity ^0.5.0;

import "./AbstractSingularDTVToken.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/// @title Fund contract - Implements reward distribution.
/// @author Stefan George - <stefan.george@consensys.net>
/// @author Milad Mostavi - <milad.mostavi@consensys.net>
contract SingularDTVFund is Ownable {
    using SafeMath for uint256;
    /*
     *  External contracts
     */
    AbstractSingularDTVToken public singularDTVToken;

    /*
     *  Structs
     */
    struct RewardsData {
        bool isPermittedToken;
        uint256 tokenInd;
        uint256 totalReward;
        // User's address => Reward at time of withdraw
        mapping(address => uint256) rewardAtTimeOfWithdraw;
        // User's address => Reward which can be withdrawn
        mapping(address => uint256) owed;
    }

    /*
     *  Storage
     */
    string public version = "0.1.0";

    RewardsData public ethRewards;

    // Token's address => rewards data
    mapping(address => RewardsData) public tokensRewards;
    address[] public tokensAddresses;
    uint256 constant MAX_NUMBER_OF_TOKENS = 10;

    /*
     *  Events
     */

    event BlacklistToken(address tokenAddress, uint256 tokenInd);

    event WhitelistToken(address tokenAddress, uint256 tokenInd);

    /*
     *  Contract functions
     */

    /// @dev Fallback function acts as depositReward()
    function() external payable {
        if (msg.value == 0) {
            withdrawRewardInEth();
        } else {
            depositRewardInEth();
        }
    }

      /// @dev Getter for ethRewards.owed[userAddress]
    /// @param userAddress User's address
    function getEthOwedFor(address userAddress) public view returns (uint256) {
        return ethRewards.owed[userAddress];
    }

    /// @dev Getter for ethRewards.rewardAtTimeOfWithdraw[userAddress]
    /// @param userAddress User's address
    function getEthRewardAtTimeOfWithdrawFor(address userAddress)
        public
        view
        returns (uint256)
    {
        return ethRewards.rewardAtTimeOfWithdraw[userAddress];
    }

    /// @dev Getter for tokensRewards[tokenAddress].owed[userAddress]
    /// @param tokenAddress address of token
    /// @param userAddress User's address
    function getTokenOwedFor(address tokenAddress, address userAddress)
        public
        view
        returns (uint256)
    {
        return tokensRewards[tokenAddress].owed[userAddress];
    }

    /// @dev Getter for tokensRewards[tokenAddress].rewardAtTimeOfWithdraw[userAddress]
    /// @param tokenAddress address of token
    /// @param userAddress User's address
    function getTokenRewardAtTimeOfWithdrawFor(
        address tokenAddress,
        address userAddress
    ) public view returns (uint256) {
        return tokensRewards[tokenAddress].rewardAtTimeOfWithdraw[userAddress];
    }

    /// @dev Getter for tokensAddresses.length
    function getTokensAddressesLength() public view returns (uint256) {
        return tokensAddresses.length;
    }

    /// @dev Only owner can whitelist token
    /// @param _tokenAddress Token address
    function whitelistToken(address _tokenAddress)
        external
        onlyOwner
        returns (bool)
    {
        require(
            tokensAddresses.length < MAX_NUMBER_OF_TOKENS,
            "whitelistToken: Can't add more tokens addresses."
        );
        uint256 tokenInd = tokensRewards[_tokenAddress].tokenInd;
        if (
            !(tokensRewards[_tokenAddress].isPermittedToken &&
                tokensAddresses.length > 0 &&
                tokensAddresses[tokenInd] == _tokenAddress)
        ) {
            tokensRewards[_tokenAddress].isPermittedToken = true;
            tokenInd = tokensAddresses.length;
            tokensRewards[_tokenAddress].tokenInd = tokenInd;
            emit WhitelistToken(
                _tokenAddress,
                tokensRewards[_tokenAddress].tokenInd
            );
            tokensAddresses.push(_tokenAddress);
            return true;
        }
        return false;
    }

    /// @dev Only owner can blacklist token
    /// @param _tokenAddress Token address
    function blacklistToken(address _tokenAddress)
        external
        onlyOwner
        returns (bool)
    {
        uint256 tokenInd = tokensRewards[_tokenAddress].tokenInd;
        if (
            tokensRewards[_tokenAddress].isPermittedToken &&
            tokensAddresses.length > 0 &&
            tokensAddresses[tokenInd] == _tokenAddress
        ) {
            tokensRewards[_tokenAddress].isPermittedToken = false;
            //if token address already exists we delete it from the list
            if (tokenInd == tokensAddresses.length - 1) {
                //if this address is in the end of list we just pop() it
                tokensAddresses.pop();
                tokensRewards[_tokenAddress].tokenInd = 0;
            } else {
                //if it's not in the end we swap it with last element and then pop()
                tokensAddresses[tokenInd] = tokensAddresses[tokensAddresses.length - 1];
                tokensAddresses.pop();
                tokensRewards[_tokenAddress].tokenInd = 0;
            }
            emit BlacklistToken(
                _tokenAddress,
                tokensRewards[_tokenAddress].tokenInd
            );
            return true;
        }
        return false;
    }

    /// @dev Credits reward to owed balance.
    /// @param _forAddress user's address.
    function softWithdrawRewardFor(address _forAddress)
        external
        returns (bool)
    {
        //Eth withdraw
        uint256 value = calcReward(_forAddress, ethRewards);
        ethRewards.rewardAtTimeOfWithdraw[_forAddress] = ethRewards.totalReward;
        ethRewards.owed[_forAddress] = ethRewards.owed[_forAddress].add(value);

        //tokens withdraw
        for (uint256 i = 0; i < tokensAddresses.length; i++) {
            RewardsData storage tokenRewards = tokensRewards[tokensAddresses[i]];
            value = calcReward(_forAddress, tokenRewards);
            tokenRewards.rewardAtTimeOfWithdraw[_forAddress] = tokenRewards
                .totalReward;
            tokenRewards.owed[_forAddress] = tokenRewards.owed[_forAddress].add(
                value
            );
        }
    }

    /// @dev Setup function sets external token address.
    /// @param _singularDTVTokenAddress Token address.
    function setTokenAddress(address _singularDTVTokenAddress)
        external
        onlyOwner
        returns (bool)
    {
        if (address(singularDTVToken) == address(0)) {
            singularDTVToken = AbstractSingularDTVToken(
                _singularDTVTokenAddress
            );
            return true;
        }
        return false;
    }

    /// @dev Withdraws reward for user. Returns reward.
    function withdrawRewardInEth() public returns (uint256) {
        uint256 value = calcReward(msg.sender, ethRewards).add(
            ethRewards.owed[msg.sender]
        );
        ethRewards.rewardAtTimeOfWithdraw[msg.sender] = ethRewards.totalReward;
        ethRewards.owed[msg.sender] = 0;
        if (value > 0 && !msg.sender.send(value)) {
            revert();
        }
        return value;
    }

    /// @dev Withdraws reward for user in tokens. Returns reward.
    /// @param _tokensAddress address of withdrawing token
    function withdrawRewardInToken(address _tokensAddress)
        public
        returns (uint256)
    {
        RewardsData storage tokenRewards = tokensRewards[_tokensAddress];
        require(
            tokenRewards.isPermittedToken,
            "Withdraw rewards in token: Got unpermitted token"
        );
        uint256 value = calcReward(msg.sender, tokenRewards).add(
            tokenRewards.owed[msg.sender]
        );
        tokenRewards.rewardAtTimeOfWithdraw[msg.sender] = tokenRewards.totalReward;
        tokenRewards.owed[msg.sender] = 0;
        IERC20 tokenContract = IERC20(_tokensAddress);
        if (value > 0 && !tokenContract.transfer(msg.sender, value)) {
            revert();
        }

        return value;
    }

    /// @dev Withdraws reward for user in Eth and all tokens
    function withdrawRewardInAll() public {
        withdrawRewardInEth();
        for (uint256 i = 0; i < tokensAddresses.length; i++) {
            withdrawRewardInToken(tokensAddresses[i]);
        }
    }

    /// @dev Deposits reward in Eth. Returns success.
    function depositRewardInEth() public payable returns (bool) {
        ethRewards.totalReward = ethRewards.totalReward.add(msg.value);
        return true;
    }

    /// @dev Deposits reward in token. Returns success.
    /// @param _tokenAddress Address of depositing token
    /// @param _amount Amount of depositing token
    function depositRewardInToken(address _tokenAddress, uint256 _amount)
        public
        returns (bool)
    {
        RewardsData storage tokenRewards = tokensRewards[_tokenAddress];
        require(
            tokenRewards.isPermittedToken,
            "Deposit in token: Got unpermitted token address"
        );
        IERC20 tokenContract = IERC20(_tokenAddress);
        require(
            tokenContract.transferFrom(msg.sender, address(this), _amount),
            "Deposit in token: Can`t transfer tokens to Fund address"
        );
        tokenRewards.totalReward = tokenRewards.totalReward.add(_amount);
        return true;
    }

    /// @dev Withdraws reward for user. Returns reward.
    /// @param _forAddress user's address.
    /// @param _rewards RewardsData where the reward will come from
    function calcReward(address _forAddress, RewardsData storage _rewards)
        private
        view
        returns (uint256)
    {
        return singularDTVToken.balanceOf(_forAddress)
                .mul(
                    _rewards.totalReward.sub(
                        _rewards.rewardAtTimeOfWithdraw[_forAddress]
                    ))
                .div(singularDTVToken.totalSupply());
        ;
    }
}
