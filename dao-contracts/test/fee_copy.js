const GenesisProtocol = artifacts.require("GenesisProtocol");
const GenericSchemeContract = artifacts.require("GenericScheme");
const FeeContract = artifacts.require("Fee");
const getDeployedAddress = require("./getDeployedAddress");

const assert = require('assert').strict;

contract("Fee", async accounts => {
    console.log(encodeFeeChangeCall("listing", 99));
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