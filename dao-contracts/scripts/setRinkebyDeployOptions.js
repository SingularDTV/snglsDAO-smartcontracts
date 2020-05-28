const fs = require("fs");
const path = require("path");

//files names
const specFile = "../data/snglDAOspec.json";
const rinkebyEnv = "../config/rinkeby.env";
const destEnv = "../.env";
const rinkebyAirdropOptions = "../../token/airdrop/script/config/options.rinkeby.js";
const destAirdropOptions = "../../token/airdrop/script/options.js";
const foundersAddresses = ["0x4fbeA1BECD2F3F24dcbdd59b2b609ABCDCDD6956", "0x3819a7547B9eC89B74bE1035BfE33c1fDD871EC0", "0x1D21686ae41be46f34eCDC0879577FC3781EB433"];
const foundersTokens = [1000000, 900000, 800000];
const foundersReputation = [0, 0, 0];

//set founder's address in spec file to current first account
const spec = require(specFile);
for (let i = 0; i < foundersAddresses.length; i++) {
    const address = foundersAddresses[i];
    const tokens = foundersTokens[i] ? foundersTokens[i] : 0;
    const reputation = foundersReputation[i] ? foundersReputation[i] : 0;
    const founder = {
        address,
        tokens,
        reputation
    }
    spec.founders[i] = founder;
}
fs.writeFileSync(path.resolve(__dirname, specFile), JSON.stringify(spec, null, 4));

//set rinkeby .env file
fs.copyFileSync(path.resolve(__dirname, rinkebyEnv), path.resolve(__dirname, destEnv));

//set rinkeby options.js in airdrop
fs.copyFileSync(path.resolve(__dirname, rinkebyAirdropOptions), path.resolve(__dirname, destAirdropOptions));

console.log("Successfully set rinkeby deploy options.\n");