require('dotenv').config();
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const provider = new HDWalletProvider(process.env.MNEMONIC, process.env.PROVIDER);
const web3 = new Web3(provider);

const feeArtifact = require("../build/contracts/Fee.json");
(async () => {
    const id = await web3.eth.net.getId();
    const feeAddress = feeArtifact.networks[id].address;

    const specFile = "../data/snglDAOspec.json";
    console.log(feeAddress);

    const fs = require("fs")
    const path = require("path");
    const spec = require(specFile);
    spec.UGenericScheme[0].targetContract = feeAddress;

    fs.writeFileSync(path.resolve(__dirname, specFile), JSON.stringify(spec, null, 4));

})();