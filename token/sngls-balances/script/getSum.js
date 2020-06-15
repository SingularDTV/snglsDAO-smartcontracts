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