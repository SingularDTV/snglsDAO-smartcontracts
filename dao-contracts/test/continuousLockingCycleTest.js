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

        const amount = 1000;
        //don't test staking on rinkeby - can't increase time to redeem;
        if ((await web3.eth.net.getId()) !== 4) {
            await SGTContractInstance.approve(LT4RInstance.address, amount);
            //! it  won't work on second run in one deploy in test network because of increaseTime function: on-chain time and real time will be different
            const startTime = await LT4RInstance.startTime();
            const batchTime = await LT4RInstance.batchTime();
            const unixTimestamp = Math.floor(Date.now() / 1000);
            const batchIndexToLockIn = Math.floor((unixTimestamp - startTime) / batchTime);
            let id = await LT4RInstance.lock.call(amount, 1, batchIndexToLockIn, "0x0");
            await LT4RInstance.lock(amount, 1, batchIndexToLockIn, "0x0");
            await increaseTime(20000);
            LT4RInstance.redeem(masterAccount, id);
        } else {
            //set yellow background and black font on warning message
            console.warn("\x1b[43m\x1b[30m" + "Can`t test locking tokens on the test net - increase time available only on ganache." + "\x1b[0m");
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