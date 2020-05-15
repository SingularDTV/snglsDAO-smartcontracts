const SGTContract = artifacts.require("DAOToken");
const LockingToken4Reputation = artifacts.require("LockingSGT4Reputation");
const ContributionReward = artifacts.require("ContributionReward");
const ReputationContract = artifacts.require("Reputation");
const Avatar = artifacts.require("Avatar");
const GenesisProtocol = artifacts.require("GenesisProtocol");
const Controller = artifacts.require("Controller");
const getDeployedAddress = require("./getDeployedAddress");
const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("ContributionReward", async accounts => {
    const masterAccount = accounts[0];
    it(`User can propose only reward in eth and external tokens`, async () => {
        const avatarAddress = await getDeployedAddress("Avatar");

        let AvatarInstance = await Avatar.at(avatarAddress);
        let SGTContractInstance = await SGTContract.at(await getDeployedAddress("DAOToken"));
        let LT4RInstance = await LockingToken4Reputation.at(await getDeployedAddress("LockingSGT4Reputation"));
        let ReputationInstance = await ReputationContract.at(await getDeployedAddress("Reputation"));
        let ContRewInstance = await ContributionReward.at(await getDeployedAddress("ContributionReward"))
        //propose
        let externalToken = await SGTContract.new("Test", "TST", 1000);
        externalToken.mint(avatarAddress, 10);

        await assert.rejects(ContRewInstance.proposeContributionReward(avatarAddress, "", 1, [0, 0, 0, 0, 1], externalToken.address, masterAccount));
        await assert.rejects(ContRewInstance.proposeContributionReward(avatarAddress, "", 0, [1, 0, 0, 0, 1], externalToken.address, masterAccount));
        await assert.doesNotReject(ContRewInstance.proposeContributionReward(avatarAddress, "", 0, [0, 1, 1, 0, 1], externalToken.address, masterAccount, {
            gas: 1000000
        }));
    });
    it(`User can vote and redeem`, async () => {
        const avatarAddress = await getDeployedAddress("Avatar");
        let AvatarInstance = await Avatar.at(avatarAddress);
        let SGTContractInstance = await SGTContract.at(await getDeployedAddress("DAOToken"));
        let LT4RInstance = await LockingToken4Reputation.at(await getDeployedAddress("LockingSGT4Reputation"));
        let ReputationInstance = await ReputationContract.at(await getDeployedAddress("Reputation"));
        let ContRewInstance = await ContributionReward.at(await getDeployedAddress("ContributionReward"))
        let ControllerInstance = await Controller.at(await getDeployedAddress("Controller"));
        //getting reputation
        const amount = 1000;
        const tokensBeforeLock = await SGTContractInstance.balanceOf.call(masterAccount);
        await SGTContractInstance.approve(LT4RInstance.address, amount);

        const reputationBeforeLock = await ReputationInstance.balanceOf.call(masterAccount);

        await LT4RInstance.lock(amount, 0);

        const tokensAfterLock = await SGTContractInstance.balanceOf.call(masterAccount);
        const reputationAfterLock = await ReputationInstance.balanceOf.call(masterAccount);

        assert.strictEqual(tokensAfterLock.sub(tokensBeforeLock).toNumber(), -amount, "Wrong tokens balance after locking.")
        assert.strictEqual(reputationAfterLock.sub(reputationBeforeLock).toNumber(), amount, "Wrong reputation balance after locking.")

        //propose
        const extTokensAmount = 7;
        let externalToken = await SGTContract.new("Test", "TST", 1000);
        await externalToken.mint(avatarAddress, extTokensAmount);
        const proposalId = await ContRewInstance.proposeContributionReward.call(avatarAddress, "", 0, [0, 0, extTokensAmount, 0, 1], externalToken.address, masterAccount);
        await assert.doesNotReject(ContRewInstance.proposeContributionReward(avatarAddress, "", 0, [0, 0, extTokensAmount, 0, 1], externalToken.address, masterAccount));


        const genesisProtocolAddress = (await ContRewInstance.parameters.call(await ControllerInstance.getSchemeParameters.call(ContRewInstance.address, avatarAddress))).intVote;
        const GenesisProtocolInstance = await GenesisProtocol.at(genesisProtocolAddress);
        await GenesisProtocolInstance.vote(proposalId, 1, 0, masterAccount);
        await ContRewInstance.redeemExternalToken(proposalId, avatarAddress);
        assert.strictEqual((await externalToken.balanceOf.call(masterAccount)).toNumber(), extTokensAmount, "Wrong balance after redeem");
    });
})