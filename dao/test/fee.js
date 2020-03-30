const ContributionRewardExt = artifacts.require("ContributionRewardExt");
const GenesisProtocol = artifacts.require("GenesisProtocol");
const Controller = artifacts.require("Controller");
const Avatar = artifacts.require("Avatar");
const SGTContract = artifacts.require("DAOToken");
const GenericSchemeContract = artifacts.require("GenericScheme");
const FeeContract = artifacts.require("Fee");

const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("Fee", async accounts => {
    const feesAndTestValues = {
        "validation": 9,
        "listing": 7,
        "transaction": 8,
    };
    let masterAccount;
    let ContributionRewardExtInstance;
    let GenesisProtocolInstance;
    let ControllerInstance;
    let AvatarInstance;
    let SGTContractInstance;
    let GenericSchemeInstance;
    let FeeInstance;
    before(async () => {
        masterAccount = accounts[0];
        ContributionRewardExtInstance = await ContributionRewardExt.deployed();
        GenesisProtocolInstance = await GenesisProtocol.deployed();
        ControllerInstance = await Controller.deployed();
        AvatarInstance = await Avatar.deployed();
        SGTContractInstance = await SGTContract.deployed();
        GenericSchemeInstance = await GenericSchemeContract.deployed();
        FeeInstance = await FeeContract.deployed();
    });
    for (const fee in feesAndTestValues) {
        if (feesAndTestValues.hasOwnProperty(fee)) {
            let k = 2;
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