const SingularDTVToken = artifacts.require("SingularDTVToken");
const SingularDTVFund = artifacts.require("SingularDTVFund");
const SGToken = artifacts.require("SGToken");

const assert = require('assert').strict;
const BN = require('bn.js');
const airdrop = require('../script/airdrop');

contract("Airdrop script", async accounts => {
    const master = accounts[0];

    let fundInstance;
    let snglsTokenInstance;
    let sgTokenInstance;
    it(`Airdrop script works.`, async () => {
        console.log(1);

        await createNewInstances();
        let tokens = 1000;
        let delta = 10;
        let balances = {};
        const accsNumber = 5;
        console.log(2);

        for (let i = 0; i < accsNumber - 1; i++) {
            const acc = accounts[i];
            const nextAcc = accounts[i + 1];
            tokens -= delta;
            delta += 10;
            await snglsTokenInstance.transfer(nextAcc, tokens, {
                from: acc
            });
            balances[acc] = (await snglsTokenInstance.balanceOf(acc)).toString();
            // console.log(`address:${acc}\n\tbalance ${(await snglsTokenInstance.balanceOf(acc)).toString()}`);
        }
        const lastAcc = accounts[accsNumber - 1]
        balances[lastAcc] = (await snglsTokenInstance.balanceOf(lastAcc)).toString();
        console.log(3);

        const balanceBeforeAirdrop = new BN(await web3.eth.getBalance(master));
        const estimatedGasCost = await airdrop(snglsTokenInstance.address, sgTokenInstance.address, web3, accounts);
        console.log(4);

        const balanceAfterAirdrop = new BN(await web3.eth.getBalance(master));
        assert.strictEqual(balanceBeforeAirdrop.sub(balanceAfterAirdrop).toString(), estimatedGasCost.toString(), "Wrong gas estimation");
        for (let i = 0; i < accsNumber; i++) {
            const acc = accounts[i];
            assert.strictEqual((await sgTokenInstance.balanceOf(acc)).toString(), balances[acc], `Balances aren't equal for address: ${acc}`);
            // console.log(`address:${acc}\n\tbalance ${(await sgTokenInstance.balanceOf(acc)).toString()}`);
        }
    });
    async function createNewInstances(snglsTotalSupply = 1000, sgTokenSupply = 1000) {
        fundInstance = await SingularDTVFund.new();
        snglsTokenInstance = await SingularDTVToken.new(fundInstance.address, master, "SingularDTV", "SNGLS", snglsTotalSupply);
        await fundInstance.setTokenAddress(snglsTokenInstance.address);
        sgTokenInstance = await SGToken.new(sgTokenSupply);
    }
});