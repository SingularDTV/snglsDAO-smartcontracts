let airdrop = require("./airdrop");
// airdrop();
const {
    eventName,
    getPastEventsOptions,
    optionsOldContractAddress,
    oldContractBuildFileName,
    optionsNewContractAddress,
    newContractBuildFileName,
    providerAddress,
    mnemonic,
    oldDecimals,
    newDecimals
} = require('./options')
contract("Airdrop", async accounts => {
    it(`Start`, async () => {
        await airdrop(web3, optionsOldContractAddress, optionsNewContractAddress)
    });
})