module.exports = {
    oldContractAddress: '',
    oldContractBuildFileName: '',
    newContractAddress: '',
    newContractBuildFileName: '',
    mnemonic: '',
    providerAddress: "ws://localhost:7545",
    resultFileName: "./results.json",
    eventName: "Transfer",
    oldDecimals: 18,
    newDecimals: 18,
    //name of the truffle build file
    getPastEventsOptions: {
        //options - https://web3js.readthedocs.io/en/v1.2.6/web3-eth-contract.html#getpastevents
        fromBlock: 0,
        toBlock: "latest"
    }
}