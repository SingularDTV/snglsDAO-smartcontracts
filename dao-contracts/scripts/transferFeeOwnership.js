require('dotenv').config();
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const provider = new HDWalletProvider(process.env.MNEMONIC, process.env.PROVIDER);
const web3 = new Web3(provider);

const getDeployedAddress = require("../test/getDeployedAddress");

const feeArtifact = require("../build/contracts/Fee.json");
(async () => {
    const id = await web3.eth.net.getId();
    const feeABI = feeArtifact.abi;
    const feeAddress = feeArtifact.networks[id].address;

    const feeInstance = new web3.eth.Contract(feeABI, feeAddress);

    const avatarAddress = await getDeployedAddress("Avatar", web3);

    const account = provider.getAddress(0);
    console.log(`Using account: ${account}`)
    console.log(`Fee contract - ${feeAddress}`);

    console.log(`Previous owner - ${await feeInstance.methods.owner().call()}`);
    console.log(`Setting owner...`);

    await feeInstance.methods.transferOwnership(avatarAddress).send({
        from: account
    });

    console.log(`New owner - ${await feeInstance.methods.owner().call()}`);

    provider.engine.stop();
})();