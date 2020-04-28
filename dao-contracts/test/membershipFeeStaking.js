const SGTContract = artifacts.require("DAOToken");
const MembershipFeeStaking = artifacts.require("MembershipFeeStaking");
const getDeployedAddress = require("./getDeployedAddress");
const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("MembershipFeeStaking", async accounts => {
    const masterAccount = accounts[0];
    it(`User is able to stake`, async () => {
        const SGTContractInstance = await SGTContract.at(getDeployedAddress("DAOToken"));
        const MembershipFeeStakingInstance = await MembershipFeeStaking.at(getDeployedAddress("MembershipFeeStaking"));
        const amount = 10;

        assert((await SGTContractInstance.balanceOf.call(masterAccount)).gten(amount), "Not enough tokens on first account");

        await SGTContractInstance.approve(MembershipFeeStakingInstance.address, amount);

        await MembershipFeeStakingInstance.stake(amount);
        assert.strictEqual((await MembershipFeeStakingInstance.balanceOf.call(masterAccount)).toNumber(), amount, "Wrong stake balance on MembershipFeeStaking contract");
    });
});