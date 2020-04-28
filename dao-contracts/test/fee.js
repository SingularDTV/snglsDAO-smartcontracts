const GenesisProtocol = artifacts.require("GenesisProtocol");
const GenericSchemeContract = artifacts.require("GenericScheme");
const FeeContract = artifacts.require("Fee");
const getDeployedAddress = require("./getDeployedAddress");

const assert = require('assert').strict;

contract("Fee", async accounts => {
    const feesAndTestValues = {
        "validation": 9,
        "listing": 7,
        "transaction": 8,
        "membership": 11
    };
    let GenesisProtocolInstance;
    let GenericSchemeInstance;
    let FeeInstance;
    before(async () => {
        GenericSchemeInstance = await GenericSchemeContract.at(getDeployedAddress("GenericSchemeFee"));
        FeeInstance = await FeeContract.at(getDeployedAddress("Fee"));
        GenesisProtocolInstance = await GenesisProtocol.at(await GenericSchemeInstance.votingMachine.call());
    });
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