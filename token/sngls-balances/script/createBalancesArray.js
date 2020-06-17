const fs = require("fs");

const balancesFromTransfersObj = require("../balancesFromTransfers.json");
const premintedAddressesArray = require("../premintedArray.json");
const saleAddressesArray = require("../tokenSaleAddressesArray.json");

//Balances obj to array
const transfersAddressesArray = [];
for (const addr in balancesFromTransfersObj) {
    if (balancesFromTransfersObj.hasOwnProperty(addr)) {
        transfersAddressesArray.push(addr);
    }
}

//Creating result addresses array 

//save addresses like obj properties to delete repeats
const addressesObj = {};

for (let i = 0; i < transfersAddressesArray.length; i++) {
    const addr = transfersAddressesArray[i];
    addressesObj[addr] = true;
}

for (let i = 0; i < premintedAddressesArray.length; i++) {
    const addr = premintedAddressesArray[i];
    addressesObj[addr] = true;
}

for (let i = 0; i < saleAddressesArray.length; i++) {
    const addr = saleAddressesArray[i];
    addressesObj[addr] = true;
}

let addressesArray = [];
console.log("Create array");

for (const addr in addressesObj) {
    if (addressesObj.hasOwnProperty(addr)) {
        addressesArray.push(addr);
    }
}

//check if all addresses are in the result array
console.log("Check");
for (let i = 0; i < addressesArray.length; i++) {
    const addr = addressesArray[i];
    if (!(transfersAddressesArray.includes(addr) || premintedAddressesArray.includes(addr) || saleAddressesArray.includes(addr)))
        console.log(`Didn't find ${addr}`);
    if (!addressesObj[addr])
        console.log(`Didn't find ${addr}`);
}
console.log("Write");
fs.writeFileSync("./addressesArray.json", JSON.stringify(addressesArray, null, 4));