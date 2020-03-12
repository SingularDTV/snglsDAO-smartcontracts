const {
    erc20ContractAddress,
    eventName,
    resultFileName,
    //name of the truffle build file
    buildFileName,
    getPastEventsOptions
} = require('./options');
// const erc20ContractAddress = "";
// const eventName = "Transfer";
// const resultFileName = "./results.json";
// //name of the truffle build file
// const buildFileName = './../build/contracts/Token.json';
// const getPastEventsOptions = {
//     //options - https://web3js.readthedocs.io/en/v1.2.6/web3-eth-contract.html#getpastevents
//     fromBlock: 0,
//     toBlock: "latest"
// }

const Web3 = require('web3');
const fs = require('fs');

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
const BN = web3.utils.BN;

const build = JSON.parse(fs.readFileSync(buildFileName));

const abi = build.abi;
const contract = new web3.eth.Contract(abi, erc20ContractAddress);

contract.getPastEvents(eventName, getPastEventsOptions, writeBalances);

function writeBalances(err, events) {
    if (err) console.log(err);
    const balancesBN = getBalancesBN(events);
    const balancesStr = {};
    for (const addr in balancesBN) {
        if (balancesBN.hasOwnProperty(addr)) {
            const val = balancesBN[addr];
            const strVal = val.toString();
            balancesStr[addr] = strVal;
            console.log(`${addr}:${strVal}`);
        }
    }
    fs.writeFileSync(resultFileName, JSON.stringify(balancesStr));
}

function getBalancesBN(events) {
    const balancesBN = {};
    events.map(event => {
        const eventValues = event.returnValues;
        const {
            from,
            to
        } = eventValues;
        const value = new BN(eventValues.value);
        if (!(from in balancesBN)) balancesBN[from] = new BN(`0`);
        if (!(to in balancesBN)) balancesBN[to] = new BN(`0`);
        balancesBN[from].isub(value);
        balancesBN[to].iadd(value);
    });
    return balancesBN;
}