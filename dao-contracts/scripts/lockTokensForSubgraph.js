//script for emitting events for subgraph setup

const LockingSGT4Reputation = artifacts.require("LockingSGT4Reputation");
const sgtTokenContract = artifacts.require("DAOToken");
const ReputationContract = artifacts.require("Reputation");
const AvatarContract = artifacts.require("Avatar");

const getDeployedAddress = require("../test/getDeployedAddress");
contract("Locking tokens for subgraph setup", accounts => {
    it(``, async () => {
        let SGTContractInstance = await sgtTokenContract.at(await getDeployedAddress("DAOToken"));
        let LT4RInstance = await LockingSGT4Reputation.at(await getDeployedAddress("LockingSGT4Reputation"));

        const amount = 1;
        await SGTContractInstance.approve(LT4RInstance.address, amount);
        await LT4RInstance.lock(amount, 0);
        console.log("\t--------- Locked ---------");
        assert(false);
    });
})