const Avatar = artifacts.require("Avatar");
const Controller = artifacts.require("Controller");
const getDeployedAddress = require("./getDeployedAddress");
const assert = require('assert').strict;

contract("SGT token binding to avatar and controller", async accounts => {
    let AvatarInstance;
    let ControllerInstance;
    let sgtAddress;
    before(async () => {
        sgtAddress = await getDeployedAddress("DAOToken");
        AvatarInstance = await Avatar.at(await getDeployedAddress("Avatar"));
        ControllerInstance = await Controller.at(await getDeployedAddress("Controller"));
    });
    it(`Avatar.nativeToken is correct`, async () => {
        assert.strictEqual(await AvatarInstance.nativeToken(), sgtAddress, "Avatar.nativeToken doesn't equal to migration file address.");
    });
    it(`Controller.nativeToken is correct`, async () => {
        assert.strictEqual(await ControllerInstance.nativeToken(), sgtAddress, "Controller.nativeToken doesn't equal to migration file address.");

    });
});