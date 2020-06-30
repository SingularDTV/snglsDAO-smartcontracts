pragma solidity 0.5.13;

import "../../dao-contracts/contracts/universalSchemes/UniversalScheme.sol";
import "../../dao-contracts/contracts/controller/Controller.sol";
import "../../dao-contracts/contracts/utils/DAOTracker.sol";


/**
 * @title ControllerCreator for creating a single controller.
 */
contract ControllerCreator {

    function create(Avatar _avatar) public returns(address) {
        Controller controller = new Controller(_avatar);
        controller.registerScheme(msg.sender, bytes32(0), bytes4(0x0000001f), address(_avatar));
        controller.unregisterScheme(address(this), address(_avatar));
        return address(controller);
    }
}

/**
 * @title Genesis Scheme that creates organizations
 */
contract DaoCreator {

    mapping(address=>address) public locks;

    event NewOrg (address _avatar);
    event InitialSchemesSet (address _avatar);

    ControllerCreator private controllerCreator;
    DAOTracker private daoTracker;

    constructor(ControllerCreator _controllerCreator, DAOTracker _daoTracker) public {
        require(_controllerCreator != ControllerCreator(0));
        require(_daoTracker != DAOTracker(0));
        controllerCreator = _controllerCreator;
        daoTracker = _daoTracker;
    }

  /**
    * @dev Create a new organization
    * @param _orgName The name of the new organization
    * @param _tokenAddress The address of the token
    * @return The address of the avatar of the controller
    */
    function forgeOrg (
        string calldata _orgName,
        address _tokenAddress
    )
    external
    returns(address)
    {
        //The call for the private function is needed to bypass a deep stack issues
        return _forgeOrg(
            _orgName,
            _tokenAddress);
    }

     /**
      * @dev Set initial schemes for the organization.
      * @param _avatar organization avatar (returns from forgeOrg)
      * @param _schemes the schemes to register for the organization
      * @param _params the schemes's params
      * @param _permissions the schemes permissions.
      * @param _metaData dao meta data hash
      */
    function setSchemes (
        Avatar _avatar,
        address[] calldata _schemes,
        bytes32[] calldata _params,
        bytes4[] calldata _permissions,
        string calldata _metaData
    )
        external
    {
        // this action can only be executed by the account that holds the lock
        // for this controller
        require(locks[address(_avatar)] == msg.sender);
        // register initial schemes:
        Controller controller = Controller(_avatar.owner());
        for (uint256 i = 0; i < _schemes.length; i++) {
            controller.registerScheme(_schemes[i], _params[i], _permissions[i], address(_avatar));
        }
        controller.metaData(_metaData, _avatar);
        // Unregister self:
        controller.unregisterScheme(address(this), address(_avatar));
        // Remove lock:
        delete locks[address(_avatar)];
        emit InitialSchemesSet(address(_avatar));
    }

    /**
     * @dev Create a new organization
     * @param _orgName The name of the new organization
     * @param _tokenAddress The address of the token
     * @return The address of the avatar of the controller
     */
    function _forgeOrg (
        string memory _orgName,
        address _tokenAddress
    ) private returns(address)
    {
        // Create Token, Reputation and Avatar:
        Reputation nativeReputation = new Reputation();
        Avatar avatar = new Avatar(_orgName, DAOToken(_tokenAddress), nativeReputation);

        Controller controller = Controller(controllerCreator.create(avatar));

        // Add the DAO to the tracking registry
        daoTracker.track(avatar, controller, "");

        // Transfer ownership:
        avatar.transferOwnership(address(controller));
        nativeReputation.transferOwnership(address(controller));

        locks[address(avatar)] = msg.sender;

        emit NewOrg (address(avatar));
        return (address(avatar));
    }
}
