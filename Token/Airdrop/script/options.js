module.exports = {
    erc20ContractAddress: '',
    buildFileName: './build/contracts/Token.json',
    resultFileName: "./results.json",
    eventName: "Transfer",
    //name of the truffle build file
    getPastEventsOptions: {
        //options - https://web3js.readthedocs.io/en/v1.2.6/web3-eth-contract.html#getpastevents
        fromBlock: 0,
        toBlock: "latest"
    }
}