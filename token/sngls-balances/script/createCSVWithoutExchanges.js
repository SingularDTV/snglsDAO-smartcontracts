const Papa = require("papaparse");
const fs = require("fs");
const Web3 = require("web3");
const BN = Web3.utils.BN;
const balances = require("../balancesFromChain.json");
const exchangesExcludingBinance = require("../exchangesWithoutBinance.json");
const binance = require("../binance.json");
(async () => {
    let data4CSV = {};
    data4CSV.fields = ["HolderAddress", "Balance"];
    data4CSV.data = [];
    let sum = new BN("0");
    let sumNeg = new BN("0");

    let exchanges = [];
    let exchangesObj = {};
    for (let i = 0; i < exchangesExcludingBinance.length; i++) {
        const addr = exchangesExcludingBinance[i].address;
        exchangesExcludingBinance[i].address = Web3.utils.toChecksumAddress(addr.toLowerCase().trim());
        exchanges.push(exchangesExcludingBinance[i].address);
        exchangesObj[exchangesExcludingBinance[i].address] = exchangesExcludingBinance[i].tag;
    }
    let binanceAddr = [];
    let binanceObj = {};
    for (let i = 0; i < binance.length; i++) {
        const addr = binance[i].address;
        binance[i].address = Web3.utils.toChecksumAddress(addr.toLowerCase().trim());
        binanceAddr.push(binance[i].address);
        binanceObj[binance[i].address] = binance[i].tag;
    }

    let exchCounter = 0;
    for (const address in balances) {
        if (balances.hasOwnProperty(address)) {
            if (exchanges.includes(address)) {
                console.log(exchangesObj[address], " - ", balances[address]);
                exchCounter++;
                continue;
            }
            if (binanceAddr.includes(address)) {
                console.log("!!!  " + binanceObj[address], " - ", balances[address]);
                exchCounter++;
            }
            const balanceBN = new BN(balances[address]);
            if (balanceBN.toString() === "0") continue;
            if (balanceBN.isNeg()) {
                sumNeg.iadd(balanceBN);
            }
            sum.iadd(balanceBN);
            const row = [];
            row.push(address);
            row.push(balanceBN.toString());
            // row.push("No");
            data4CSV.data.push(row);
        }
    }
    console.log("Counter ", exchCounter);

    console.log(`sum:${sum.toString()}`);
    console.log(`sumNeg:${sumNeg.toString()}`);
    const CSVString = Papa.unparse(data4CSV, {
        // quotes: true,
        header: false,
        newline: "\r\n"
    });
    console.log("Write result file");
    fs.writeFileSync("./balances.csv", CSVString);
    console.log("Wrote result file");
})()