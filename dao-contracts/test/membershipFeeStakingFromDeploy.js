const SGTContract = artifacts.require("DAOToken");
const MembershipFeeStaking = artifacts.require("MembershipFeeStaking");
const getDeployedAddress = require("./getDeployedAddress");
const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("MembershipFeeStaking", async accounts => {
    const masterAccount = accounts[0];
    it(`User is able to stake`, async () => {
        const SGTContractInstance = await SGTContract.at(await getDeployedAddress("DAOToken"));
        const MembershipFeeStakingInstance = await MembershipFeeStaking.at(await getDeployedAddress("MembershipFeeStaking"));

        const amount = 1000;
        const tokensBeforeLock = await SGTContractInstance.balanceOf.call(masterAccount);
        await SGTContractInstance.approve(MembershipFeeStakingInstance.address, amount);


        await MembershipFeeStakingInstance.lock(amount, 0);

        const tokensAfterLock = await SGTContractInstance.balanceOf.call(masterAccount);

        assert.strictEqual(tokensAfterLock.sub(tokensBeforeLock).toNumber(), -amount, "Wrong tokens balance after locking.")

        await MembershipFeeStakingInstance.release(masterAccount);

        const tokensAfterRelease = await SGTContractInstance.balanceOf.call(masterAccount);

        assert(tokensAfterRelease.eq(tokensBeforeLock), "Wrong tokens balance after release");
    });
    
});