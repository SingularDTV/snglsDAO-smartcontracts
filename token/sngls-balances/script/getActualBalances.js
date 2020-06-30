/*
    This script takes list of addresses and requests balances from chain for each address.
    Then it writes results to file.
*/
const contractAddress = "0xaec2e87e0a235266d9c5adc9deb4b2e29b54d009";
const addresses = require("../addressesArray.json")
//number of block which limits balanceOf() call - any changes after this block wouldn't be seen
const cliProgress = require('cli-progress');
const fs = require("fs");
const Web3 = require("web3");
const assert = require("assert");
const {
    loadavg
} = require('os');
const BN = Web3.utils.BN;
// const web3 = new Web3('wss://mainnet.infura.io/ws/v3/a0bb216866fa4c4fa318eaddffc02eb6');
// const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/a0bb216866fa4c4fa318eaddffc02eb6'));
const web3 = new Web3("ws://161.35.21.230:8546");
const erc20abi = require("../../../dao-contracts/build/contracts/ERC20.json").abi;
const erc20contract = new web3.eth.Contract(erc20abi, contractAddress);

(async () => {

    const bar = new cliProgress.SingleBar({
        format: 'Getting balances | {bar} | {percentage}% || {value}/{total} addresses || ETA: {eta_formatted} || Duration {duration_formatted}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });

    let balancesFromChain = {};
    bar.start(addresses.length, 0);
    let divider = 60;
    let n = 1;
    for (let i = 0; i < addresses.length; i++) {
        const addr = addresses[i];
        // const balanceFromChain = await erc20contract.methods.balanceOf(addr).call({}, toBlock);
        const balanceFromChain = await erc20contract.methods.balanceOf(addr).call();
        balancesFromChain[addr] = balanceFromChain;
        if (i >= Math.floor(addresses.length / divider * n)) {
            fs.writeFileSync("./balancesFromChain.json", `Last address - ${i.toString()}\n` + JSON.stringify(balancesFromChain, null, 4));
            n++;
        }
        bar.increment();
    }
    bar.stop();
    console.log("Write results to ./balancesFromChain.json");

    fs.writeFileSync("./balancesFromChain.json", JSON.stringify(balancesFromChain, null, 4));
})()