const fs = require("fs");

const balancesFromTransfersObj = require("../balancesFromTransfers.json");
const premintedAddressesArray = require("../premintedArray.json");
const saleAddressesArray = require("../tokenSaleAddressesArray.json");
const Web3 = require("web3");
//Balances obj to array
const transfersAddressesArray = [];
for (let addr in balancesFromTransfersObj) {
    if (balancesFromTransfersObj.hasOwnProperty(addr)) {
        transfersAddressesArray.push(addr);
    }
}

//Creating result addresses array 

//save addresses like obj properties to delete repeats
let addressesObj = {};

let counter = 0;

for (let i = 0; i < transfersAddressesArray.length; i++) {
    let addr = transfersAddressesArray[i];
    addr = Web3.utils.toChecksumAddress(addr.toLowerCase().trim());
    if (addressesObj[addr]) {
        counter++;
    }
    addressesObj[addr] = true;
}

for (let i = 0; i < premintedAddressesArray.length; i++) {
    let addr = premintedAddressesArray[i];
    addr = Web3.utils.toChecksumAddress(addr.toLowerCase().trim());
    if (addressesObj[addr]) {
        counter++;
    }
    addressesObj[addr] = true;
}

for (let i = 0; i < saleAddressesArray.length; i++) {
    let addr = saleAddressesArray[i];
    addr = Web3.utils.toChecksumAddress(addr.toLowerCase().trim());
    if (addressesObj[addr]) {
        counter++;
    }
    addressesObj[addr] = true;
}

console.log(`Counter - ${counter}`);


let addressesArray = [];
console.log("Create array");

for (let addr in addressesObj) {
    if (addressesObj.hasOwnProperty(addr)) {
        addressesArray.push(Web3.utils.toChecksumAddress(addr.toLowerCase().trim()));
    }
}

//check if all addresses are in the result array
console.log("Check");
for (let i = 0; i < addressesArray.length; i++) {
    let addr = addressesArray[i];
    if (!(transfersAddressesArray.includes(addr) || premintedAddressesArray.includes(addr) || saleAddressesArray.includes(addr)))
        console.log(`Didn't find ${addr}`);
    if (!addressesObj[addr])
        console.log(`Didn't find ${addr}`);
}
console.log("Write");
fs.writeFileSync("./addressesArray.json", JSON.stringify(addressesArray, null, 4));