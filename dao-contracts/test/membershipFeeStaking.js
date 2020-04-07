const Controller = artifacts.require("Controller");
const Avatar = artifacts.require("Avatar");
const SGTContract = artifacts.require("DAOToken");
const MembershipFeeStaking = artifacts.require("MembershipFeeStaking");
const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("MembershipFeeStaking", async accounts => {
    const masterAccount = accounts[0];
    it(`User is able to stake`, async () => {
        let ControllerInstance = await Controller.deployed();
        let AvatarInstance = await Avatar.deployed();
        let SGTContractInstance = await SGTContract.deployed();
        let MembershipFeeStakingInstance = await MembershipFeeStaking.deployed();
        const amount = 1234;

        await SGTContractInstance.mint(masterAccount, amount);
        assert.strictEqual((await SGTContractInstance.balanceOf.call(masterAccount)).toNumber(), amount, "Can't mint tokens to masterAccount");

        await SGTContractInstance.approve(MembershipFeeStakingInstance.address, amount);

        await MembershipFeeStakingInstance.stake(amount);
        assert.strictEqual((await MembershipFeeStakingInstance.balanceOf.call(masterAccount)).toNumber(), amount, "Wrong stake balance on MembershipFeeStaking contract");
    });
});