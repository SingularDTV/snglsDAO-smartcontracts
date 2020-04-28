// const Controller = artifacts.require("Controller");
// const Avatar = artifacts.require("Avatar");
const migration = require("../data/migration.json");
const SGTContract = artifacts.require("DAOToken");
const ContinuousLocking4Reputation = artifacts.require("ContinuousLocking4Reputation");
const ReputationContract = artifacts.require("Reputation");
const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("ContinuousLocking4Reputation", async accounts => {
    const masterAccount = accounts[0];
    it(`It works`, async () => {
        // let ControllerInstance = await Controller.deployed();
        // let AvatarInstance = await Avatar.deployed();

        const singularMigration = migration.private.dao["0.0.1-rc.32"];

        let SGTContractInstance = await SGTContract.at(singularMigration.DAOToken);
        let LT4RInstance = await ContinuousLocking4Reputation.at(singularMigration.Schemes[3].address);
        let ReputationInstance = await ReputationContract.at(singularMigration.Reputation);

        const amount = 1000;
        // await SGTContractInstance.mint(masterAccount, amount);
        await SGTContractInstance.approve(LT4RInstance.address, amount);
        let id = await LT4RInstance.lock.call(amount, 1, 0, "0x0");
        await LT4RInstance.lock(amount, 1, 0, "0x0");
        await increaseTime(20000);
        // assert.strictEqual((await LT4RInstance.redeem.call(masterAccount)).toNumber(), amount, "Wrong redeem reputation");
        console.log((await LT4RInstance.redeem.call(masterAccount, id)).toString());
        await assert.doesNotReject(LT4RInstance.redeem(masterAccount, id));
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