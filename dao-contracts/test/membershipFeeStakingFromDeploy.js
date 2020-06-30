const SNGLSToken = artifacts.require("DAOToken");
const MembershipFeeStaking = artifacts.require("MembershipFeeStaking");
const getDeployedAddress = require("./getDeployedAddress");
let singularContractAddress = require("../../token/contracts/build/contracts/SingularDTVToken.json");

const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("MembershipFeeStaking", async accounts => {
    const masterAccount = accounts[0];
    it(`User is able to stake`, async () => {
        singularContractAddress = singularContractAddress.networks[await web3.eth.net.getId()].address;

        const SNGLSContractInstance = await SNGLSToken.at(singularContractAddress);
        const MembershipFeeStakingInstance = await MembershipFeeStaking.at(await getDeployedAddress("MembershipFeeStaking"));

        let lockTime = 0;
        const amount = 1000;

        const tokensBeforeLock = await SNGLSContractInstance.balanceOf.call(masterAccount);

        await SNGLSContractInstance.approve(MembershipFeeStakingInstance.address, amount);

        let totalLockedBefore = await MembershipFeeStakingInstance.totalLocked();
        await MembershipFeeStakingInstance.lock(amount, lockTime);
        let totalLockedAfter = await MembershipFeeStakingInstance.totalLocked();

        const tokensAfterLock = await SNGLSContractInstance.balanceOf.call(masterAccount);

        assert.strictEqual(tokensAfterLock.sub(tokensBeforeLock).toNumber(), -amount, "Wrong tokens balance after locking.")
        assert.strictEqual(
            totalLockedAfter.toString(),
            totalLockedBefore.addn(amount).toString(),
            "Bad total lock"
        );
        totalLockedBefore = totalLockedAfter;
        await MembershipFeeStakingInstance.release();
        totalLockedAfter = await MembershipFeeStakingInstance.totalLocked();
        assert.strictEqual(
            totalLockedBefore.subn(amount).toString(),
            totalLockedAfter.toString(),
            "Bad total lock"
        );
        const tokensAfterRelease = await SNGLSContractInstance.balanceOf.call(masterAccount);

        assert(tokensAfterRelease.eq(tokensBeforeLock), "Wrong tokens balance after release");
        assert.strictEqual(
            totalLockedAfter.toString(),
            totalLockedBefore.sub(new BN(amount)).toString(),
            "Bad total lock"
        );
    });

});