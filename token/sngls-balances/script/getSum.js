let balances = require("../balancesFromChain.json");
const Web3 = require("web3");
const BN = Web3.utils.BN;

let sum = new BN("0");
for (const add in balances) {
    if (balances.hasOwnProperty(add)) {
        const balance = new BN(balances[add]);
        sum.iadd(balance);
    }
}
console.log(sum.toString())

const Papa = require("papaparse");
const fs = require("fs");
let csvString = fs.readFileSync("./balances.csv").toString();

Papa.parse(csvString, {
    // header: true,
    // dynamicTyping: true,
    complete: function (results) {
        const sum = new BN("0");
        const data = results.data;
        for (let i = 0; i < data.length; i++) {
            const el = data[i];
            sum.iadd(new BN(el[1]));
        }
        console.log(sum.toString());

    }
});