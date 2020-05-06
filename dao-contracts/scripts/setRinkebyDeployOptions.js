const fs = require("fs");
const path = require("path");

//files names
const specFile = "../data/snglDAOspec.json";
const rinkebyEnv = "../config/rinkeby.env";
const destEnv = "../.env";
const rinkebyAirdropOptions = "../../token/airdrop/script/config/options.rinkeby.js";
const destAirdropOptions = "../../token/airdrop/script/options.js";
const founderAddress = "0x4fbeA1BECD2F3F24dcbdd59b2b609ABCDCDD6956";

//set founder's address in spec file to current first account
const spec = require(specFile);
spec.founders[0].address = founderAddress;
fs.writeFileSync(path.resolve(__dirname, specFile), JSON.stringify(spec));

//set rinkeby .env file
fs.copyFileSync(path.resolve(__dirname, rinkebyEnv), path.resolve(__dirname, destEnv));

//set rinkeby options.js in airdrop
fs.copyFileSync(path.resolve(__dirname, rinkebyAirdropOptions), path.resolve(__dirname, destAirdropOptions));

console.log("Successfully set rinkeby deploy options.\n");