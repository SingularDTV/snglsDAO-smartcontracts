const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require('web3');
const fs = require('fs');
const getBalancesNotConfigured = require("./getBalances");
const {
    eventName,
    getPastEventsOptions,
    oldContractAddress,
    oldContractBuildFileName,
    newContractAddress,
    newContractBuildFileName,
    providerAddress,
    mnemonic,
    oldDecimals,
    newDecimals
} = require('./options');

const optionsOldContractAddress = oldContractAddress;
const optionsNewContractAddress = newContractAddress;

const provider = new HDWalletProvider(mnemonic, providerAddress);
const optionsWeb3 = new Web3(provider);
const BN = Web3.utils.BN;

const oldBuild = JSON.parse(fs.readFileSync(oldContractBuildFileName));
const oldAbi = oldBuild.abi;

const newBuild = JSON.parse(fs.readFileSync(newContractBuildFileName));
const newAbi = newBuild.abi;


const oldDecimalsFactor = (new BN("10")).pow(new BN(oldDecimals));
const newDecimalsFactor = (new BN("10")).pow(new BN(newDecimals));
const decimalsCoefficient = (new BN("10")).pow(new BN(oldDecimals - newDecimals));


module.exports = async function airdrop(web3 = optionsWeb3, oldContractAddress = optionsOldContractAddress, newContractAddress = optionsNewContractAddress) {

    console.log(`Start preparing for airdrop\n`);
    const accounts = await web3.eth.getAccounts();

    const eth = web3.eth;
    // const accounts = await web3.eth.getAccounts();
    const masterAcc = accounts[0];

    const oldToken = new web3.eth.Contract(oldAbi, oldContractAddress);
    const newToken = new web3.eth.Contract(newAbi, newContractAddress);
    const getBalances = await getBalancesNotConfigured(oldContractAddress);
    // const events = await oldToken.getPastEvents(eventName, getPastEventsOptions, (err, events) => {
    //     if (err) console.dir(err);
    //     console.log(events)
    // });
    // console.dir(events);
    // const balancesOld = getBalances(events);
    const balancesOld = getBalances();


    let sum = new BN('0');
    for (const addr in balancesOld) {
        if (balancesOld.hasOwnProperty(addr)) {
            const value = balancesOld[addr];
            sum.iadd(value);
        }
    }

    const sumInNewDecimals = sum.mul(decimalsCoefficient);


    // let tokSup = await newToken.methods.balanceOf(masterAcc).call();
    const newTokensSupply = new BN(8);
    //check if we have enough tokens to airdrop
    if (newTokensSupply.lt(sum)) throw new Error(`Not enough new tokens to airdrop. Required number of tokens: ${sum.toString()}, available number of tokens: ${newTokensSupply.toString()}`);
    console.log("Enough new tokens to airdrop.");
    console.log("Check if estimated balances equals to values on chain.");
    for (const addr in balancesOld) {
        if (balancesOld.hasOwnProperty(addr) && !!addr) {
            const value = balancesOld[addr];
            if (value.isNeg()) continue;
            const onChainValue = new BN(await oldToken.methods.balanceOf(addr).call());
            if (!value.eq(onChainValue)) throw new Error(`Wrong balance for address: ${addr}, value on chain is ${onChainValue.toString()}, estimated value is ${value.toString()}`);
        }
    }
    console.log("Estimated balances equals to values on chain.");

    const balancesNew = {};
    const estimatedGas = new BN('0');
    const gasPrice = new BN(await eth.getGasPrice());
    for (const addr in balancesOld) {
        if (balancesOld.hasOwnProperty(addr)) {

            if (addr == masterAcc) continue;
            const oldValue = balancesOld[addr];
            const newValue = oldValue.mul(decimalsCoefficient)
            if (newValue.isNeg()) continue;
            console.log(`Estimate transfer -- address:${addr}`);

            balancesNew[addr] = newValue;
            estimatedGas.iadd(new BN(await newToken.methods.transfer(addr, newValue.toString()).estimateGas({
                from: masterAcc
            })));
        }
    }
    console.log(`Airdrop gas estimation: ${estimatedGas.toString()} units`);

    const estimatedGasCost = estimatedGas.mul(gasPrice);
    const ethBalance = new BN(await eth.getBalance(masterAcc));
    if (ethBalance.lt(estimatedGasCost)) throw Error(`Not enough eth on balance to send airdrop transactions. Estimated gas cost: ${estimatedGasCost.toString()} wei, available eth: ${ethBalance.toString()} wei`);
    console.log(`Estimated gas cost: ${estimatedGasCost.toString()} wei, available eth: ${ethBalance.toString()} wei.`);
    console.log(`Estimated gas cost: ${web3.utils.fromWei(estimatedGasCost).toString()} eth, available eth: ${web3.utils.fromWei(ethBalance).toString()} eth.`);

    console.log('\nAirdrop started...');
    for (const addr in balancesNew) {
        if (balancesNew.hasOwnProperty(addr)) {
            const value = balancesNew[addr];
            await newToken.methods.transfer(addr, value.toString()).send({
                from: masterAcc,
                gasPrice: gasPrice.toString()
            })
        }
    }
    console.log(`Airdrop ended.`);
    provider.engine.stop();
    return estimatedGasCost;
}