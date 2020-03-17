const SingularDTVToken = artifacts.require("SingularDTVToken");
const SingularDTVFund = artifacts.require("SingularDTVFund");
const ERC20Token = artifacts.require("ERC20Token");

const assert = require('assert').strict;
const BN = require('bn.js');

contract("SingularDTVFund", async accounts => {
    /*
     * Inititialize
     */
    let owner = accounts[0];

    let user = accounts[1];
    let fromUser = {
        from: user
    };

    let fundInstance;
    let snglsTokenInstance;

    /*
     * Tests
     */

    describe('blacklistToken()/whitelistToken()', async () => {
        context('Owner is able to set token permittance:', async () => {
            it('Permitted token address is added to the list end if it wasn`t there', async () => {
                await createNewSingularDTVInstances();

                //asserts are in the function
                await permitToken();
            });
            it('Permitted token address just leaves in the list if it was there', async () => {
                await createNewSingularDTVInstances();

                //permit first token
                let {
                    tokenInstance: firstTokenInstance
                } = await permitToken();

                //permit second token
                await permitToken();

                //permit first token second time
                await permitToken(firstTokenInstance);
                assert.strictEqual((await fundInstance.tokensRewards(firstTokenInstance.address)).tokenInd.toNumber(), 0, "first token added to list again");

            });
            it('Unpermitted token address is deleted from the list if it was there', async () => {
                await createNewSingularDTVInstances();

                //permit first token
                let {
                    tokenInstance: firstTokenInstance
                } = await permitToken();

                //permit second token
                let {
                    tokenInstance: secondTokenInstance
                } = await permitToken();

                let tokenListLength = (await fundInstance.getTokensAddressesLength()).toNumber();

                //unpermit
                let event = (await fundInstance.blacklistToken(firstTokenInstance.address)).logs[0];

                assert.strictEqual((await fundInstance.getTokensAddressesLength()).toNumber(), tokenListLength - 1, "token list has not decreased");
                assert.strictEqual(event.args.tokenInd.toNumber(), 0, "token address exists in the list");
                assert.ok(!(await fundInstance.tokensRewards(firstTokenInstance.address)).isPermittedToken, "token is permitted");

                //now second token address must be in the first (index 0) place
                let secondTokenAddressInList = await fundInstance.tokensAddresses(0);
                assert.strictEqual(secondTokenAddressInList, secondTokenInstance.address, "second token isn't in right place or doesn`t exist");
            });
            it(`Unpermitted token address leave list as it is if it wasn't there`, async () => {
                await createNewSingularDTVInstances();

                //permit first token
                await permitToken();

                //permit second token
                await permitToken();

                let tokenListLength = (await fundInstance.getTokensAddressesLength()).toNumber();


                let tokenInstance = await ERC20Token.new(0);
                //unpermit third token
                (await fundInstance.blacklistToken(tokenInstance.address)).logs[0];

                let tokenAddressInList = await fundInstance.tokensAddresses((await fundInstance.tokensRewards(tokenInstance.address)).tokenInd.toNumber());

                assert.strictEqual((await fundInstance.getTokensAddressesLength()).toNumber(), tokenListLength, "token list has decreased");
                assert.strictEqual((await fundInstance.tokensRewards(tokenInstance.address)).tokenInd.toNumber(), 0, "token address exists in the list");
                assert.notStrictEqual(tokenAddressInList, tokenInstance.address, "token address exists in the list");
                assert.ok(!(await fundInstance.tokensRewards(tokenInstance.address)).isPermittedToken, "token is permitted");
            });
        });
        it('Owner is unable to permit more than 10 token addresses', async () => {
            await createNewSingularDTVInstances();
            const tokensInstances = await createNewTokensInstances(11);
            for (let i = 0; i < 10; i++) {
                const tokenInstance = tokensInstances[i];
                await permitToken(tokenInstance);
            }
            await assert.rejects(permitToken(tokensInstances[tokensInstances.length]), "can add more than 10 token's addresses");

        });
        it('User is unable to set token permittance', async () => {
            await createNewSingularDTVInstances();
            const tokenInstance = await ERC20Token.new(0)

            await assert.rejects(fundInstance.whitelistToken(tokenInstance.address, fromUser));
            await assert.rejects(fundInstance.blacklistToken(tokenInstance.address, fromUser));
        });
    });

    describe('depositRewardInEth()', async () => {

        it('User is able to deposit reward in Eth', async () => {
            await createNewSingularDTVInstances();
            await fundInstance.depositRewardInEth({
                from: user,
                value: web3.utils.toWei('0.1', 'ether')
            });
            assert.equal((await fundInstance.ethRewards()).totalReward.toString(), web3.utils.toWei("0.1", 'ether'), "Total reward value doesn't equal to sent value");
        });

    });

    describe('depositRewardInToken()', async () => {
        it('User is able to deposit reward in permitted token', async () => {
            await createNewSingularDTVInstances();
            const tokenInitialSupply = 100;
            let tokenInstance = await ERC20Token.new(tokenInitialSupply, fromUser);
            await permitToken(tokenInstance);
            await tokenInstance.approve(fundInstance.address, tokenInitialSupply, fromUser);
            await fundInstance.depositRewardInToken(tokenInstance.address, tokenInitialSupply, fromUser);
            assert.strictEqual((await fundInstance.tokensRewards(tokenInstance.address)).totalReward.toNumber(), tokenInitialSupply, "Token's total reward doesn't equal to sent tokens amount");
        });
        it('User is unable to deposit reward in unpermitted token', async () => {
            await createNewSingularDTVInstances();
            const tokenInitialSupply = 100;
            let tokenInstance = await ERC20Token.new(tokenInitialSupply, fromUser);
            //permits another token
            await permitToken();
            await tokenInstance.approve(fundInstance.address, tokenInitialSupply, fromUser);
            await assert.rejects(fundInstance.depositRewardInToken(tokenInstance.address, tokenInitialSupply, fromUser));
        });
    });

    describe('withdrawRewardInEth()', async () => {
        it('User is able to withdraw in Eth', async () => {
            await createNewSingularDTVInstances(100);
            await snglsTokenInstance.transfer(user, 100);
            await fundInstance.depositRewardInEth({
                from: user,
                value: web3.utils.toWei('0.1', 'ether')
            });
            const returnedWithdrawn = (await fundInstance.withdrawRewardInEth.call(fromUser));
            assert.strictEqual(returnedWithdrawn.toString(), web3.utils.toWei('0.1', 'ether'), "returned withdrawn is different from what it should be");

            // calculate real withdrawn eth
            const balanceBeforeTx = new BN(await web3.eth.getBalance(user));
            const receipt = (await fundInstance.withdrawRewardInEth(fromUser)).receipt;
            const gasUsed = new BN(receipt.gasUsed);
            const tx = await web3.eth.getTransaction(receipt.transactionHash);
            const gasPrice = new BN(tx.gasPrice);
            const txEthSpent = gasUsed.mul(gasPrice);
            const charged = (new BN(await web3.eth.getBalance(user))).sub(balanceBeforeTx);
            const realWithdrawn = charged.add(txEthSpent);
            assert.strictEqual(realWithdrawn.toString(), web3.utils.toWei('0.1', 'ether'), "real withdrawn value is different from what it should be");
        });
    });

    describe('withdrawRewardInToken()', async () => {
        it('User is able to withdraw in permitted token', async () => {
            await createNewSingularDTVInstances(100);
            await snglsTokenInstance.transfer(user, 100);

            const tokenInitialSupply = 100;
            let tokenInstance = await ERC20Token.new(tokenInitialSupply);
            permitToken(tokenInstance);
            await tokenInstance.approve(fundInstance.address, tokenInitialSupply);
            await fundInstance.depositRewardInToken(tokenInstance.address, tokenInitialSupply);

            const returnedWithdrawn = new BN((await fundInstance.withdrawRewardInToken.call(tokenInstance.address, fromUser)));
            assert.strictEqual(returnedWithdrawn.toNumber(), tokenInitialSupply, "returned withdrawn is different from what it should be");

            await fundInstance.withdrawRewardInToken(tokenInstance.address, fromUser);
            const realWithdrawn = await tokenInstance.balanceOf(user);
            assert.strictEqual(realWithdrawn.toNumber(), tokenInitialSupply, "real withdrawn value is different from what it should be");
        });

        it('User is unable to withdraw in unpermitted token', async () => {
            await createNewSingularDTVInstances(100);
            await snglsTokenInstance.transfer(user, 100);


            let tokenInstance = await ERC20Token.new(100);
            await assert.rejects(fundInstance.withdrawRewardInToken(tokenInstance.address, fromUser));
        });

        it('User is unable to withdraw in unpermitted token even if it was once permitted', async () => {
            await createNewSingularDTVInstances(100);
            await snglsTokenInstance.transfer(user, 100);

            const tokenInitialSupply = 100;
            let tokenInstance = await ERC20Token.new(tokenInitialSupply);
            permitToken(tokenInstance);
            await tokenInstance.approve(fundInstance.address, tokenInitialSupply);
            await fundInstance.depositRewardInToken(tokenInstance.address, tokenInitialSupply);
            // unpermit token
            await fundInstance.blacklistToken(tokenInstance.address);

            await assert.rejects(fundInstance.withdrawRewardInToken(tokenInstance.address, fromUser));
        });
    });

    describe('withdrawInAll()', async () => {
        it('User is able to withdraw in Eth and all permitted tokens', async () => {
            await createNewSingularDTVInstances(100);
            await snglsTokenInstance.transfer(user, 100);
            await fundInstance.depositRewardInEth({
                from: user,
                value: web3.utils.toWei('0.1', 'ether')
            });


            const tokensInitialSupply = 100;
            const tokensInstances = await createNewTokensInstances(5, tokensInitialSupply);
            for (let i = 0; i < tokensInstances.length; i++) {
                const tokenInstance = tokensInstances[i];
                permitToken(tokenInstance);
                await tokenInstance.approve(fundInstance.address, tokensInitialSupply);
                await fundInstance.depositRewardInToken(tokenInstance.address, tokensInitialSupply);
            }

            const balanceBeforeTx = new BN(await web3.eth.getBalance(user));
            const receipt = (await fundInstance.withdrawRewardInAll(fromUser)).receipt;

            // Check Eth withdraw
            // calculate real withdrawn eth
            const gasUsed = new BN(receipt.gasUsed);
            const tx = await web3.eth.getTransaction(receipt.transactionHash);
            const gasPrice = new BN(tx.gasPrice);
            const txEthSpent = gasUsed.mul(gasPrice);
            const charged = (new BN(await web3.eth.getBalance(user))).sub(balanceBeforeTx);
            const realWithdrawn = charged.add(txEthSpent);
            assert.strictEqual(realWithdrawn.toString(), web3.utils.toWei('0.1', 'ether'), "eth: real withdrawn value is different from what it should be");

            // Check tokens withdraw
            for (let i = 0; i < tokensInstances.length; i++) {
                const tokenInstance = tokensInstances[i];
                const realWithdrawn = await tokenInstance.balanceOf(user);
                assert.strictEqual(realWithdrawn.toNumber(), tokensInitialSupply, "token: real withdrawn value is different from what it should be");
            }

        });
    });

    describe('softWithdrawRewardFor()', async () => {
        it('Contract or user is able to call soft withdraw function and it works', async () => {
            await createNewSingularDTVInstances(100);
            await snglsTokenInstance.transfer(user, 100);
            await fundInstance.depositRewardInEth({
                from: user,
                value: web3.utils.toWei('0.1', 'ether')
            });

            const tokensInitialSupply = 100;
            const tokensInstances = await createNewTokensInstances(5, tokensInitialSupply);
            for (let i = 0; i < tokensInstances.length; i++) {
                const tokenInstance = tokensInstances[i];
                permitToken(tokenInstance);
                await tokenInstance.approve(fundInstance.address, tokensInitialSupply);
                await fundInstance.depositRewardInToken(tokenInstance.address, tokensInitialSupply);
            }

            await fundInstance.softWithdrawRewardFor(user);

            // Check Eth owed
            const owedEth = await fundInstance.getEthOwedFor(user);
            assert.strictEqual(owedEth.toString(), web3.utils.toWei('0.1', 'ether'), "eth: owed value is different from what it should be");

            // Check tokens owed
            for (let i = 0; i < tokensInstances.length; i++) {
                const tokenInstance = tokensInstances[i];
                const owedToken = await fundInstance.getTokenOwedFor(tokenInstance.address, user);
                assert.strictEqual(owedToken.toNumber(), tokensInitialSupply, "token: owed value is different from what it should be");
            }
        });
    });


    /*
     * Helpers
     */

    async function permitToken(tokenInstance = false, initialAmount = 0) {
        if (!tokenInstance) {
            tokenInstance = await ERC20Token.new(initialAmount)
        }

        let event = (await fundInstance.whitelistToken(tokenInstance.address)).logs[0];
        let tokenAddressInList = await fundInstance.tokensAddresses((await fundInstance.tokensRewards(tokenInstance.address)).tokenInd.toNumber());

        assert.strictEqual(tokenInstance.address, tokenAddressInList, "token address in the list doesn't equal to actual");
        assert.ok((await fundInstance.tokensRewards(tokenInstance.address)).isPermittedToken, "token isn`t permitted");

        return {
            event,
            tokenInstance
        };
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

});