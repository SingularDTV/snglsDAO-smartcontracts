const SGTContract = artifacts.require("DAOToken");
const LockingToken4Reputation = artifacts.require("LockingSGT4Reputation");
const ReputationContract = artifacts.require("Reputation");

const getDeployedAddress = require("./getDeployedAddress");
const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("LockingSGT4Reputation", async accounts => {
    const masterAccount = accounts[0];
    it(`User can lock and release`, async () => {


        let SGTContractInstance = await SGTContract.at(await getDeployedAddress("DAOToken"));
        let LT4RInstance = await LockingToken4Reputation.at(await getDeployedAddress("LockingSGT4Reputation"));
        let ReputationInstance = await ReputationContract.at(await getDeployedAddress("Reputation"));

        const amount = "100000000000000";
        const tokensBeforeLock = await SGTContractInstance.balanceOf.call(masterAccount);
        await SGTContractInstance.approve(LT4RInstance.address, amount);

        const reputationBeforeLock = await ReputationInstance.balanceOf.call(masterAccount);
        let totalLockedBefore = await LT4RInstance.totalLocked();

        await LT4RInstance.lock(amount, 0);

        let totalLockedAfter = await LT4RInstance.totalLocked();
        const tokensAfterLock = await SGTContractInstance.balanceOf.call(masterAccount);
        const reputationAfterLock = await ReputationInstance.balanceOf.call(masterAccount);

        assert.strictEqual(
            totalLockedAfter.toString(),
            totalLockedBefore.add(new BN(amount)).toString(),
            "Bad total lock"
        );
        assert.strictEqual(tokensAfterLock.sub(tokensBeforeLock).toString(), (-amount).toString(), "Wrong tokens balance after locking.")
        assert.strictEqual(reputationAfterLock.sub(reputationBeforeLock).toString(), amount.toString(), "Wrong reputation balance after locking.")

        totalLockedBefore = totalLockedAfter;

        await LT4RInstance.release();

        totalLockedAfter = await LT4RInstance.totalLocked();
        assert.strictEqual(
            totalLockedAfter.toString(),
            totalLockedBefore.sub(new BN(amount)).toString(),
            "Bad total lock"
        );

        const tokensAfterRelease = await SGTContractInstance.balanceOf.call(masterAccount);
        const reputationAfterRelease = await ReputationInstance.balanceOf.call(masterAccount);

        assert(tokensAfterRelease.eq(tokensBeforeLock), "Wrong tokens balance after release");
        assert(reputationAfterRelease.eq(reputationBeforeLock), "Wrong reputation balance after release");


    });
})

function increaseTime(addSeconds) {
    const id = Date.now();

    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'evm_increaseTime',
            params: [addSeconds],
            id,
        }, (err1) => {
            if (err1) return reject(err1);

            web3.currentProvider.send({
                jsonrpc: '2.0',
                method: 'evm_mine',
                id: id + 1,
            }, (err2, res) => (err2 ? reject(err2) : resolve(res)));
        });
    });
}