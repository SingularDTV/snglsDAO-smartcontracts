const {
    erc20ContractAddress,
    eventName,
    resultFileName,
    buildFileName,
    getPastEventsOptions,
    providerAddress
} = require('./options');

const Web3 = require('web3');
const fs = require('fs');

const web3 = new Web3(providerAddress);
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