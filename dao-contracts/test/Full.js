const SGTContract = artifacts.require("DAOToken");
const ContinuousLocking4Reputation = artifacts.require("ContinuousLocking4Reputation");
const ReputationContract = artifacts.require("Reputation");

const MembershipFeeStaking = artifacts.require("MembershipFeeStaking");

const GenesisProtocol = artifacts.require("GenesisProtocol");
const GenericSchemeContract = artifacts.require("GenericScheme");
const FeeContract = artifacts.require("Fee");

const getDeployedAddress = require("./getDeployedAddress");
const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("Full test", async accounts => {
    const masterAccount = accounts[0];
    it(`It works`, async () => {

        //locking token

        let SGTContractInstance = await SGTContract.at(await getDeployedAddress("DAOToken"));
        let LT4RInstance = await ContinuousLocking4Reputation.at(await getDeployedAddress("ContinuousLocking4Reputation"));
        let ReputationInstance = await ReputationContract.at(await getDeployedAddress("Reputation"));

        let amount = 100;

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


        //membership fee
        const MembershipFeeStakingInstance = await MembershipFeeStaking.at(await getDeployedAddress("MembershipFeeStaking"));
        amount = 10;

        assert((await SGTContractInstance.balanceOf.call(masterAccount)).gten(amount), "Not enough tokens on first account");
        let amountBeforeStaking = (await MembershipFeeStakingInstance.balanceOf.call(masterAccount)).toNumber();
        await SGTContractInstance.approve(MembershipFeeStakingInstance.address, amount);

        await MembershipFeeStakingInstance.stake(amount);
        assert.strictEqual((await MembershipFeeStakingInstance.balanceOf.call(masterAccount)).toNumber(), amountBeforeStaking + amount, "Wrong stake balance on MembershipFeeStaking contract");

        //fee
        const feesAndTestValues = {
            "validation": 9,
            "listing": 7,
            "transaction": 8,
            "membership": 11
        };

        let GenericSchemeInstance = await GenericSchemeContract.at(await getDeployedAddress("GenericSchemeFee"));
        let FeeInstance = await FeeContract.at(await getDeployedAddress("Fee"));

        let GenesisProtocolInstance = await GenesisProtocol.at(await GenericSchemeInstance.votingMachine());

        for (const fee in feesAndTestValues) {
            if (feesAndTestValues.hasOwnProperty(fee)) {
                let k = 0;
                let testValue = feesAndTestValues[fee];
                it(`Set ${fee} fee`, async () => {
                    const proposalId = await GenericSchemeInstance.proposeCall.call(encodeFeeChangeCall(fee, testValue), 0, `Change ${fee} fee`);
                    await GenericSchemeInstance.proposeCall(encodeFeeChangeCall(fee, testValue), 0, `Change ${fee} fee`);
                    for (let i = 0; i <= k; i++) {
                        const acc = accounts[i];
                        await GenesisProtocolInstance.vote(proposalId, 1, 0, acc, {
                            from: acc
                        });
                    }
                    assert.strictEqual((await FeeInstance[`${fee}Fee`].call()).toNumber(), testValue, "Expected fee value doesn't equal to on-chain values.");
                });
            }
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

function encodeFeeChangeCall(feeName, newFee) {
    return web3.eth.abi.encodeFunctionCall({
        name: `set${feeName[0].toUpperCase()+feeName.slice(1).toLowerCase()}Fee`,
        type: 'function',
        inputs: [{
            type: 'uint256',
            name: `_${feeName.toLowerCase()}Fee`
        }]
    }, [newFee]);
}