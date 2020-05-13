const SGTContract = artifacts.require("DAOToken");
const LockingToken4Reputation = artifacts.require("LockingSGT4Reputation");
const ReputationContract = artifacts.require("Reputation");

const getDeployedAddress = require("./getDeployedAddress");
const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("LockingToken4Reputation", async accounts => {
    const masterAccount = accounts[0];
    it(`User can stake`, async () => {


        let SGTContractInstance = await SGTContract.at(await getDeployedAddress("DAOToken"));
        let LT4RInstance = await LockingToken4Reputation.at(await getDeployedAddress("LockingSGT4Reputation"));
        let ReputationInstance = await ReputationContract.at(await getDeployedAddress("Reputation"));

        const amount = 1000;

        console.log((await ReputationInstance.balanceOf.call(masterAccount)).toString());

        await SGTContractInstance.approve(LT4RInstance.address, amount);

        await LT4RInstance.lock(amount, 0);

        console.log((await ReputationInstance.balanceOf.call(masterAccount)).toString());

        // console.log(
        //     await LT4RInstance.release.call(masterAccount)
        // );
        // await LT4RInstance.release(masterAccount);

        // console.log((await ReputationInstance.balanceOf.call(masterAccount)).toString());

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