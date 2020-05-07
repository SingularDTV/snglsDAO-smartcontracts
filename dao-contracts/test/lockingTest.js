const SGTContract = artifacts.require("DAOToken");
const ContinuousLocking4Reputation = artifacts.require("ContinuousLocking4Reputation");
const ReputationContract = artifacts.require("Reputation");

const getDeployedAddress = require("./getDeployedAddress");
const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("ContinuousLocking4Reputation", async accounts => {
    const masterAccount = accounts[0];
    it(`User can stake`, async () => {


        let SGTContractInstance = await SGTContract.at(await getDeployedAddress("DAOToken"));
        let LT4RInstance = await ContinuousLocking4Reputation.at(await getDeployedAddress("ContinuousLocking4Reputation"));
        let ReputationInstance = await ReputationContract.at(await getDeployedAddress("Reputation"));

        const amount = 1000000000;

        await SGTContractInstance.approve(LT4RInstance.address, amount);
        //! it  won't work on second run in one deploy in test network because of increaseTime function: on-chain time and real time will be different
        const startTime = await LT4RInstance.startTime();
        const batchTime = await LT4RInstance.batchTime();
        const unixTimestamp = Math.floor(Date.now() / 1000);
        // const nowTime = await LT4RInstance.getNow();
        const batchIndexToLockIn = Math.floor((unixTimestamp - startTime) / batchTime);
        const nowTime = (await web3.eth.getBlock("latest")).timestamp;
        console.log("now time: " + (new Date(nowTime * 1000)).toLocaleString());
        console.log("start time: " + (new Date(startTime.toNumber() * 1000)).toLocaleString());
        console.log("batch time: " + (batchTime / 60).toString() + " minutes");
        console.log("batch index to lock in: " + batchIndexToLockIn.toString());
        if (true) {
            let id = await LT4RInstance.lock.call(amount, 1, batchIndexToLockIn, "0x0");
            console.log("id: " + id);

            console.dir((await LT4RInstance.lock(amount, 1, batchIndexToLockIn, "0x0")).receipt.logs[0].args[1].toString());
            console.log("locked");

            await new Promise(resolve => setTimeout(resolve, 250 * 1000));
            // await increaseTime(batchTime);
            console.log("rep: " + (await LT4RInstance.redeem.call(masterAccount, id)).toString());
            LT4RInstance.redeem(masterAccount, id);
            console.log(await ReputationInstance.balanceOf.call(masterAccount));

        }

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