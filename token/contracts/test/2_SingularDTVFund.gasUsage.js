const SingularDTVToken = artifacts.require("SingularDTVToken");
const SingularDTVFund = artifacts.require("SingularDTVFund");
const ERC20Token = artifacts.require("ERC20Token");
const assert = require('assert');
const BN = require('bn.js');

contract("SingularDTVFund test withdrawInAll() gas usage", async accounts => {

    let owner = accounts[0];

    let user = accounts[1];
    let fromUser = {
        from: user
    };

    let fundInstance;
    let snglsTokenInstance;

    //Test
    for (let i = 4; i <= 10; i++) {
        it(``, async () => {
            await testWithdrawInAllGasUsage(i);
        });
    }

    async function testWithdrawInAllGasUsage(tokensContractsNumber) {
        await createNewSingularDTVInstances(100);
        await snglsTokenInstance.transfer(user, 100);
        await fundInstance.depositRewardInEth({
            from: user,
            value: web3.utils.toWei('0.1', 'ether')
        });


        const tokensInitialSupply = 100;
        const tokensInstances = await createNewTokensInstances(tokensContractsNumber, tokensInitialSupply);
        for (let i = 0; i < tokensInstances.length; i++) {
            const tokenInstance = tokensInstances[i];
            await permitToken(tokenInstance);
            await tokenInstance.approve(fundInstance.address, tokensInitialSupply);
            await fundInstance.depositRewardInToken(tokenInstance.address, tokensInitialSupply);
        }

        const receipt = (await fundInstance.withdrawRewardInAll(fromUser)).receipt;
        const gasUsed = new BN(receipt.gasUsed);
        const tx = await web3.eth.getTransaction(receipt.transactionHash);
        const gasPrice = new BN(tx.gasPrice);
        const txEthSpent = gasUsed.mul(gasPrice);
        console.log(`\n       withdrawInAll(), tokens contracts number - ${tokensContractsNumber}:
            gas used: ${gasUsed.toString()}
            gas price:${gasPrice.toString()}
            gas used in eth equivalent: ${web3.utils.fromWei(txEthSpent, 'ether').toString()}`);
    }
    async function createNewSingularDTVInstances(snglsTotalSupply = 0) {
        fundInstance = await SingularDTVFund.new();
        snglsTokenInstance = await SingularDTVToken.new(fundInstance.address, owner, "SingularDTV", "SNGLS", snglsTotalSupply);
        await fundInstance.setTokenAddress(snglsTokenInstance.address);
    }
    async function createNewTokensInstances(number, initialSupply = 0) {
        let tokenInstances = [];
        for (let i = 0; i < number; i++) {
            tokenInstances.push(await ERC20Token.new(initialSupply));
        }
        return tokenInstances;
    }
    async function permitToken(tokenInstance = false, initialAmount = 0) {
        if (!tokenInstance) {
            tokenInstance = await ERC20Token.new(initialAmount)
        }

        let event = (await fundInstance.whitelistToken(tokenInstance.address)).logs[0];
        let tokenAddressInList = await fundInstance.tokensAddresses(event.args.tokenInd.toNumber());

        assert.strictEqual(tokenInstance.address, tokenAddressInList, "token address in the list doesn't equal to actual");
        assert.ok((await fundInstance.tokensRewards(tokenInstance.address)).isPermittedToken, "token isn`t permitted");

        return {
            event,
            tokenInstance
        };
    }

})