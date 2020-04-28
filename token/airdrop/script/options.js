const getDeployedAddress = require("../../../dao-contracts/test/getDeployedAddress");
module.exports = {
    oldContractAddress: '0x00aBc5cb6B7b15a2DE2F8455e1c9e4Bd1f841661',
    //name of the truffle build file
    oldContractBuildFileName: './script/ERC20.json',

    newContractAddress: getDeployedAddress("DAOToken"),
    //name of the truffle build file
    newContractBuildFileName: './script/ERC20.json',
    mnemonic: 'myth like bonus scare over problem client lizard pioneer submit female collect',
    providerAddress: "ws://localhost:8545",
    resultFileName: "./results.json",
    eventName: "Transfer",
    oldDecimals: 18,
    newDecimals: 18,
    getPastEventsOptions: {
        //options - https://web3js.readthedocs.io/en/v1.2.6/web3-eth-contract.html#getpastevents
        fromBlock: 0,
        toBlock: "latest"
    }
}