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
// const web3 = new Web3("wss://mainnet.infura.io/ws/v3/a0bb216866fa4c4fa318eaddffc02eb6");
let rpcUrl = "https://mainnet.infura.io/v3/a0bb216866fa4c4fa318eaddffc02eb6";
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

// const web3 = new Web3("ws://161.35.21.230:8546");
const erc20abi = require("../../../dao-contracts/build/contracts/ERC20.json").abi;
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


    // initialize the bar
    bar.start(latestBlock - contractStartBlock, 0, {
        message: `Divider:${divider} | Chunk:${chunk}`
    });

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
    fs.writeFileSync("./plainEvents.json", JSON.stringify(events, null, 4));
    writeBalances(events);
    const balancesStr = {};
    for (const address in balancesBN) {
        if (balancesBN.hasOwnProperty(address)) {
            const balanceBN = balancesBN[address];
            balancesStr[address] = balanceBN.toString();
        }
    }

    fs.writeFileSync("./balancesFromTransfers.json", JSON.stringify(balancesStr, null, 4));

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
})()