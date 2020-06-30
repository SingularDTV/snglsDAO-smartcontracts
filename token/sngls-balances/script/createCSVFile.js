const Papa = require("papaparse");
const fs = require("fs");
const BN = require("web3").utils.BN;
const balances = require("../balancesFromChain.json");

(async () => {
    let data4CSV = {};
    data4CSV.fields = ["HolderAddress", "Balance", "PendingBalanceUpdate"];
    data4CSV.data = [];
    let sum = new BN("0");
    let sumNeg = new BN("0");
    for (const address in balances) {
        if (balances.hasOwnProperty(address)) {
            const balanceBN = new BN(balances[address]);
            if (balanceBN.toString() === "0") continue;
            if (balanceBN.isNeg()) {
                sumNeg.iadd(balanceBN);
            }
            sum.iadd(balanceBN);
            const row = [];
            row.push(address);
            row.push(balanceBN.toString());
            row.push("No");
            data4CSV.data.push(row);
        }
    }
    console.log(`sum:${sum.toString()}`);
    console.log(`sumNeg:${sumNeg.toString()}`);
    const CSVString = Papa.unparse(data4CSV, {
        quotes: true
    });
    console.log("Write result file");
    fs.writeFileSync("./balances.csv", CSVString);
    console.log("Wrote result file");
})()