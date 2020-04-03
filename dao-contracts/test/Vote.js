const ContributionRewardExt = artifacts.require("ContributionRewardExt");
const GenesisProtocol = artifacts.require("GenesisProtocol");
const Controller = artifacts.require("Controller");
const Avatar = artifacts.require("Avatar");
const SGTContract = artifacts.require("DAOToken");

const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("Absolute vote", async accounts => {
    const masterAccount = accounts[0];
    it(`It works`, async () => {
        let ContributionRewardExtInstance = await ContributionRewardExt.deployed();
        let GenesisProtocolInstance = await GenesisProtocol.deployed();
        let ControllerInstance = await Controller.deployed();
        let AvatarInstance = await Avatar.deployed();
        let SGTContractInstance = await SGTContract.deployed();
        let proposalId = await ContributionRewardExtInstance.proposeContributionReward.call("Some description", 1, [2, 3, 4], SGTContractInstance.address, accounts[2], masterAccount);

        await ContributionRewardExtInstance.proposeContributionReward("Some description", 1, [2, 3, 4], SGTContractInstance.address, accounts[2], masterAccount);

        const ReputationContract = artifacts.require("Reputation");
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
        await ContributionRewardExtInstance.redeemReputation(proposalId);
        // assert(false);
    });
})