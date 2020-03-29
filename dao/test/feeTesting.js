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

    it(`It works`, async () => {
        const masterAccount = accounts[0];
        const ContributionRewardExtInstance = await ContributionRewardExt.deployed();
        const GenesisProtocolInstance = await GenesisProtocol.deployed();
        const ControllerInstance = await Controller.deployed();
        const AvatarInstance = await Avatar.deployed();
        const SGTContractInstance = await SGTContract.deployed();
        const GenericSchemeInstance = await GenericSchemeContract.deployed();
        const FeeInstance = await FeeContract.deployed();

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
        console.log(await FeeInstance.listingFee());
        console.log(FeeInstance.address);

        const proposalId = await GenericSchemeInstance.proposeCall.call(encodeFeeChangeCall("listing", "11"), 0, "Some description");
        await GenericSchemeInstance.proposeCall(encodeFeeChangeCall("listing", '11'), 0, "Some description");

        // const proposalId = await GenericSchemeInstance.proposeCall.call(FeeInstance.setListingFee.getData(33).encodeABI(), 0, "Some description");
        // await GenericSchemeInstance.proposeCall(FeeInstance.setListingFee.getData(33).encodeABI(), 0, "Some description");

        // const proposalId = await GenericSchemeInstance.proposeCall.call(web3.eth.abi.encodeFunctionCall({
        //     name: `setListingFee`,
        //     type: 'function',
        //     inputs: [{
        //         type: 'uint256',
        //         name: `_listingFee`
        //     }]
        // }, ["11"]), 0, "Some description");
        // await GenericSchemeInstance.proposeCall(web3.eth.abi.encodeFunctionCall({
        //     name: `setListingFee`,
        //     type: 'function',
        //     inputs: [{
        //         type: 'uint256',
        //         name: `_listingFee`
        //     }]
        // }, ["11"]), 0, "Some description");

        // const ReputationContract = artifacts.require("Reputation");
        // const ReputationInstance = await ReputationContract.deployed();
        // for (let i = 0; i <= 5; i++) {
        //     await ReputationInstance.mint(accounts[i], 100);
        // }
        for (let i = 0; i <= 3; i++) {
            const acc = accounts[i];
            await GenesisProtocolInstance.vote(proposalId, 1, 0, acc, {
                from: acc
            });
        }

        console.log(await FeeInstance.listingFee());
        assert(false);
    });
});