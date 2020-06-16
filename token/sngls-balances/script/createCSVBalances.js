/*
    Work in progress
    This script creates the list of balances for specific erc20 contract.
    It takes Transfer events from blockchain and calculates balances from transfers history.
    Then it takes the list of users which got tokens without any transfer (for example on crowdsale) and requests actual balances for them.
    When all balances are known, it creates file with results
*/

// block from which script will start taking events
const contractStartBlock = 2364413;
const eventName = "Transfer";
const contractAddress = "0xaec2e87e0a235266d9c5adc9deb4b2e29b54d009";


const cliProgress = require('cli-progress');
const saleUsers = require("./../usersWithoutEvents.json");
const Papa = require("papaparse");
const fs = require("fs");
const Web3 = require("web3");
const {
    assert
} = require("console");
const {
    loadavg
} = require('os');
const BN = Web3.utils.BN;
// const web3 = new Web3('wss://mainnet.infura.io/ws/v3/a0bb216866fa4c4fa318eaddffc02eb6');
const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/a0bb216866fa4c4fa318eaddffc02eb6'));
const erc20abi = require("../build/contracts/ERC20.json").abi;
const erc20contract = new web3.eth.Contract(erc20abi, contractAddress);

(async () => {
    // create new progress bar
    const bar = new cliProgress.SingleBar({
        format: 'Getting events | {bar} | {percentage}% || {value}/{total} Blocks || ETA: {eta} || Duration {duration} || {message}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });

    const latestBlock = await web3.eth.getBlockNumber();


    let divider = 3;
    let balancesBN = [];
    const events = [];
    let chunk = Math.floor((latestBlock - contractStartBlock) / divider);
    let pointer = contractStartBlock;


    // initialize the bar - defining payload token "speed" with the default value "N/A"
    bar.start(latestBlock - contractStartBlock, 0, {
        message: `Divider:${divider} | Chunk:${chunk}`
    });

    // stop the bar
    let go = true;
    while (go) {
        try {
            let toBlock;
            if (pointer > latestBlock) {
                toBlock = latestBlock;
                go = false;
            } else toBlock = pointer + chunk;
            await erc20contract.getPastEvents(eventName, {
                fromBlock: pointer,
                toBlock: toBlock
            }, writeEvents);
            bar.update(pointer - contractStartBlock);
        } catch (error) {

        }
    }
    bar.stop();

    let data4CSV = {};
    data4CSV.fields = ["HolderAddress", "Balance", "PendingBalanceUpdate"];
    data4CSV.data = [];
    console.log();
    console.log();
    // console.log(`Negative:`);
    // let negative = {};
    let sum = new BN("0");
    let sumNeg = new BN("0");
    const balancesStr = {};
    for (const address in balancesBN) {
        if (balancesBN.hasOwnProperty(address)) {
            // if (balancesBN[address].toString() != "0") {
            const balanceBN = balancesBN[address];
            if (balanceBN.isNeg()) {
                sumNeg.iadd(balanceBN);
                // negative[address] = {
                //     fromTransfers: balanceBN.toString(),
                //     actual: await erc20contract.methods.balanceOf(address).call()
                // }
                // console.log(`${address} - ${balanceBN.toString()} / ${negative[address].actual}`);
            }
            sum.iadd(balanceBN);
            const row = [];
            balancesStr[address] = balanceBN.toString();
            row.push(address);
            row.push(balanceBN.toString());
            row.push("No");
            data4CSV.data.push(row);
            // }
        }
    }
    // fs.writeFileSync("./negativeBalances.json", JSON.stringify(negative, null, 4));
    // console.log(data4CSV);
    console.log(`sum:${sum.toString()}`);
    console.log(`sumNeg:${sumNeg.toString()}`);
    fs.writeFileSync("./balances.json", JSON.stringify(balancesStr, null, 4));
    const CSVString = Papa.unparse(data4CSV, {
        quotes: true
    });
    // console.log(CSVString);

    fs.writeFileSync("./balances.csv", CSVString);
})()

function writeEvents(error, eventsChunk) {
    if (error) {
        pointer = pointer - chunk;
        divider += 3;
        chunk = Math.floor((latestBlock - pointer) / divider);
        bar.update(null, {
            message: `Divider:${divider} | Chunk:${chunk}`
        })
        pointer = pointer + chunk;
    } else {
        lastBlock = pointer;
        assert(Array.isArray(eventsChunk));
        events.push(...eventsChunk);
        pointer = pointer + chunk;
    }
}

function writeBalances(events) {
    const _balancesBN = getBalancesBN(events);
    const balancesStr = {};
    for (const addr in _balancesBN) {
        if (_balancesBN.hasOwnProperty(addr)) {
            const val = _balancesBN[addr];
            const strVal = val.toString();
            balancesStr[addr] = strVal;
        }
    }
    balancesBN = _balancesBN;
    return _balancesBN;
}

function getBalancesBN(events) {
    const balancesBN = {};
    events.map(event => {
        const eventValues = event.returnValues;
        // console.log(eventValues);

        // const {
        //     _from,
        //     _to
        // } = eventValues;
        const from = eventValues[0].trim();
        const to = eventValues[1].trim();
        const value = new BN(eventValues[2]);
        if (!(from in balancesBN)) balancesBN[from] = new BN(`0`);
        if (!(to in balancesBN)) balancesBN[to] = new BN(`0`);
        balancesBN[from].isub(value);
        balancesBN[to].iadd(value);
    });
    return balancesBN;
}

writeBalances(events);
for (let i = 0; i < saleUsers.length; i++) {
    const user = saleUsers[i];
    let balance = await erc20contract.methods.balanceOf(user).call();

    let balanceFromTransfers = balancesBN[user.trim()] ? balancesBN[user.trim()].toString() : 0;
    console.log(`${user} - ${balance.toString()} / ${balanceFromTransfers} `);
    balancesBN[user] = new BN(balance);
}