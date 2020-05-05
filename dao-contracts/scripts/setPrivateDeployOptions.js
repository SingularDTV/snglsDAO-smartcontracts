const fs = require("fs");
const path = require("path");

//files names
const specFile = "../data/snglDAOspec.json";
const rinkebyEnv = "../config/private.env";
const destEnv = "../.env";
const rinkebyAirdropOptions = "../../token/airdrop/script/config/options.private.js";
const destAirdropOptions = "../../token/airdrop/script/options.js";
const founderAddress = "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1";

//set founder's address in spec file to current first account
const spec = require(specFile);
spec.founders[0].address = founderAddress;
fs.writeFileSync(path.resolve(__dirname, specFile), JSON.stringify(spec));

//set private .env file
fs.copyFileSync(path.resolve(__dirname, rinkebyEnv), path.resolve(__dirname, destEnv));

//set private options.js in airdrop
fs.copyFileSync(path.resolve(__dirname, rinkebyAirdropOptions), path.resolve(__dirname, destAirdropOptions));

console.log("Successfully set private deploy options.\n");