const getDeployedAddress = require("../../../dao-contracts/test/getDeployedAddress");
const singularContractAddress = require("../../contracts/build/contracts/SingularDTVToken.json").networks[4].address
module.exports = {
    oldContractAddress: singularContractAddress,
    //name of the truffle build file
    oldContractBuildFileName: './script/ERC20.json',

    newContractAddress: getDeployedAddress("DAOToken"),
    //name of the truffle build file
    newContractBuildFileName: './script/ERC20.json',
    mnemonic: "dumb denial cover ski deer local chaos recipe remove old time copper",
    providerAddress: 'https://rinkeby.infura.io/v3/ef306a43234747eb9c087e5301ed9363',
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