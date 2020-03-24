const ContributionRewardExt = artifacts.require("ContributionRewardExt");
const AbsoluteVote = artifacts.require("AbsoluteVote");
const Controller = artifacts.require("Controller");
const Avatar = artifacts.require("Avatar");
const SGTContract = artifacts.require("DAOToken");

const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("Absolute vote", async accounts => {
    const master = accounts[0];
    it(`It works`, async () => {
        let ContributionRewardExtInstance = await ContributionRewardExt.deployed();
        let AbsoluteVoteInstance = await AbsoluteVote.deployed();
        let ControllerInstance = await Controller.deployed();
        let AvatarInstance = await Avatar.deployed();
        let SGTContractInstance = await SGTContract.deployed();
        let proposalId = await ContributionRewardExtInstance.proposeContributionReward.call("Some description", 1, [2, 3, 4], SGTContractInstance.address, accounts[2], master);
        console.log(proposalId);

        await ContributionRewardExtInstance.proposeContributionReward("Some description", 1, [2, 3, 4], SGTContractInstance.address, accounts[2], master);
        for (let i = 0; i < 6; i++) {
            const acc = accounts[i];
            await AbsoluteVoteInstance.vote(proposalId, 1, 0, acc, {
                from: acc
            });
        }
        
        assert(false);
    });
})