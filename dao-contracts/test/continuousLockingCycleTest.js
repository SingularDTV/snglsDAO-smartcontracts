const SGTContract = artifacts.require("DAOToken");
const ContinuousLocking4Reputation = artifacts.require("ContinuousLocking4Reputation");
const ReputationContract = artifacts.require("Reputation");

const getDeployedAddress = require("./getDeployedAddress");
const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("ContinuousLocking4Reputation", async accounts => {
    const masterAccount = accounts[0];
    it(`User can stake`, async () => {


        let SGTContractInstance = await SGTContract.at(getDeployedAddress("DAOToken"));
        let LT4RInstance = await ContinuousLocking4Reputation.at(getDeployedAddress("ContinuousLocking4Reputation"));
        let ReputationInstance = await ReputationContract.at(getDeployedAddress("Reputation"));

        const amount = 1000;
        await SGTContractInstance.approve(LT4RInstance.address, amount);
        //!!! you must specify that before testing
        const batchIndexToLockIn = 0;
        let id = await LT4RInstance.lock.call(amount, 1, batchIndexToLockIn, "0x0");
        await LT4RInstance.lock(amount, 1, batchIndexToLockIn, "0x0");
        await increaseTime(20000);
        console.log((await LT4RInstance.redeem.call(masterAccount, id)).toString());
        LT4RInstance.redeem(masterAccount, id);
        console.log(await ReputationInstance.balanceOf.call(masterAccount));

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