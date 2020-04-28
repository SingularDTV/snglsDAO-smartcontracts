const {
    oldContractAddress: erc20ContractAddressOpt,
    eventName,
    resultFileName,
    oldContractBuildFileName: buildFileName,
    getPastEventsOptions,
    providerAddress
} = require('./options');

const Web3 = require('web3');
const fs = require('fs');

const web3 = new Web3(providerAddress);
const BN = web3.utils.BN;

const build = JSON.parse(fs.readFileSync(buildFileName));

const abi = build.abi;

module.exports = async function (erc20ContractAddress = erc20ContractAddressOpt) {
    const contract = new web3.eth.Contract(abi, erc20ContractAddress);
    let gotEvents;
    let blnBN;
    await contract.getPastEvents(eventName, getPastEventsOptions, writeBalances);
    return getBln;

    function writeBalances(err, events) {
        gotEvents = events;
        if (err) console.log(err);
        const balancesBN = getBalancesBN(events);
        const balancesStr = {};
        for (const addr in balancesBN) {
            if (balancesBN.hasOwnProperty(addr)) {
                const val = balancesBN[addr];
                const strVal = val.toString();
                balancesStr[addr] = strVal;
            }
        }
        fs.writeFileSync(resultFileName, JSON.stringify(balancesStr));
        blnBN = balancesBN;
        return balancesBN;
    }

    function getBln() {
        return blnBN;
    }

    function getBalancesBN(events) {
        const balancesBN = {};
        events.map(event => {
            const eventValues = event.returnValues;
            // console.log(eventValues);

            // const {
            //     _from,
            //     _to
            // } = eventValues;
            const from = eventValues[0];
            const to = eventValues[1];
            const value = new BN(eventValues[2]);
            if (!(from in balancesBN)) balancesBN[from] = new BN(`0`);
            if (!(to in balancesBN)) balancesBN[to] = new BN(`0`);
            balancesBN[from].isub(value);
            balancesBN[to].iadd(value);
        });
        return balancesBN;
    }

}