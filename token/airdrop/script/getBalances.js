const {
    oldContractAddress: erc20ContractAddress,
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

module.exports = async function (erc20ContractAddress = erc20ContractAddress) {
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
            const {
                _from,
                _to
            } = eventValues;
            const value = new BN(eventValues._value);
            if (!(_from in balancesBN)) balancesBN[_from] = new BN(`0`);
            if (!(_to in balancesBN)) balancesBN[_to] = new BN(`0`);
            balancesBN[_from].isub(value);
            balancesBN[_to].iadd(value);
        });
        return balancesBN;
    }

}