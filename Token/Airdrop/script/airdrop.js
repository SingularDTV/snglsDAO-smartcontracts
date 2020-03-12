const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require('web3');
const {
    erc20ContractAddress,
    buildFileName,
    providerAddress, 
    mnemonic
} = require('./options');

const provider = new HDWalletProvider(mnemonic, providerAddress);
const Web3 = require('web3');
const fs = require('fs');

const web3 = new Web3(providerAddress);
const BN = web3.utils.BN;

const web3 = new Web3(provider);

