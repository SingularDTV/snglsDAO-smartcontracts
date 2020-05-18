const LockingSGT4Reputation = artifacts.require("LockingSGT4Reputation");
const sgtTokenContract = artifacts.require("DAOToken");
const ReputationContract = artifacts.require("Reputation");
const AvatarContract = artifacts.require("Avatar");

const getDeployedAddress = require("./getDeployedAddress");
const assert = require('assert').strict;
const BN = web3.utils.BN;


contract("LockingSGT4Reputation", async accounts => {

    let SGTContractInstance;
    let LT4RInstance;
    let ReputationInstance;
    let AvatarInstance;
    let minPeriod;
    before(async () => {
        SGTContractInstance = await sgtTokenContract.at(await getDeployedAddress("DAOToken"));
        LT4RInstance = await LockingSGT4Reputation.at(await getDeployedAddress("LockingSGT4Reputation"));
        ReputationInstance = await ReputationContract.at(await getDeployedAddress("Reputation"));
        AvatarInstance = await AvatarContract.at(await getDeployedAddress("Avatar"));
        minPeriod = await LT4RInstance.minLockingPeriod.call();
    });
    const masterAccount = accounts[0];
    it(`User can lock and release`, async () => {

        const amount = 1000;
        const tokensBeforeLock = await SGTContractInstance.balanceOf.call(masterAccount);
        await SGTContractInstance.approve(LT4RInstance.address, amount);

        const reputationBeforeLock = await ReputationInstance.balanceOf.call(masterAccount);

        await LT4RInstance.lock(amount, 0);

        const tokensAfterLock = await SGTContractInstance.balanceOf.call(masterAccount);
        const reputationAfterLock = await ReputationInstance.balanceOf.call(masterAccount);

        assert.strictEqual(tokensAfterLock.sub(tokensBeforeLock).toNumber(), -amount, "Wrong tokens balance after locking.")
        assert.strictEqual(reputationAfterLock.sub(reputationBeforeLock).toNumber(), amount, "Wrong reputation balance after locking.")

        await LT4RInstance.release(masterAccount);

        const tokensAfterRelease = await SGTContractInstance.balanceOf.call(masterAccount);
        const reputationAfterRelease = await ReputationInstance.balanceOf.call(masterAccount);

        assert(tokensAfterRelease.eq(tokensBeforeLock), "Wrong tokens balance after release");
        assert(reputationAfterRelease.eq(reputationBeforeLock), "Wrong reputation balance after release");


    });

    it("Check initialization", async () => {

        let sgtTokenAddress = await LT4RInstance.sgtToken.call();
        assert.strictEqual(
            SGTContractInstance.address,
            sgtTokenAddress,
            "Wrong SGT token address"
        );
    });

    it("initialize twice test", async () => {

        let errorRaised = undefined;

        try {
            await LT4RInstance.initialize(AvatarInstance.address, SGTContractInstance.address, 5000, {
                from: accounts[1]
            })
        } catch (error) {
            errorRaised = error;
        }

        console.log(`error:${errorRaised}`);
        let MinPeriod = await LT4RInstance.minLockingPeriod();

        assert.notEqual(
            errorRaised,
            undefined,
            "Error must be thrown"
        );

        assert.notEqual(
            errorRaised.message.search("can be called only one time"),
            -1,
            "Wrong error raised"
        );
        assert.strictEqual(
            MinPeriod.toNumber(),
            minPeriod.toNumber(),
            `Min period rewrote`
        );
    });

    // // todo: test with other tokens too
    // // todo: call unlock | lock from not staker (only owner can unstake / stake)

    it("should stake tokens and mint reputation", async () => {

        let stakingTime = 700000;
        let amountToLock = 200;
        let currentTime = Math.floor(Date.now() / 1000);

        await SGTContractInstance.approve(LT4RInstance.address, amountToLock, {
            from: accounts[1]
        });
        const reputationBeforeLock = await ReputationInstance.balanceOf.call(accounts[1]);
        const totalLockedBeforeLock = await LT4RInstance.totalLocked();

        await LT4RInstance.lock(amountToLock, stakingTime, {
            from: accounts[1]
        });
        const reputationAfterLock = await ReputationInstance.balanceOf.call(accounts[1]);
        let totalLocked = await LT4RInstance.totalLocked();
        let lockerAfterLock = await LT4RInstance.lockers(accounts[1]);


        // console.log(totalLocked.toNumber(), "\n\n***\n\n", lockers.amount.toNumber(), lockers.releaseTime.toNumber(), stakingTime + currentTime)

        // todo: add balances check 
        console.log("BLNCS: ", await SGTContractInstance.balanceOf(accounts[1]), await SGTContractInstance.balanceOf(LT4RInstance.address));


        assert.strictEqual(
            lockerAfterLock.releaseTime.toNumber(),
            stakingTime + currentTime,
            "Bad release time"
        );
        assert.strictEqual(
            reputationAfterLock.sub(reputationBeforeLock).toNumber(),
            amountToLock,
            "Bad reputation amount"
        );
        assert.strictEqual(
            lockerAfterLock.amount.sub(lockerBeforeLock.amount).toNumber(),
            amountToLock,
            "Bad staked amount"
        );
        assert.strictEqual(
            totalLocked.sub(totalLockedBeforeLock).toNumber(),
            amountToLock,
            "Bad total lock"
        );
    });

    it("should stake tokens and mint reputation", async () => {

        let stakingTime = 900000;
        let amountToLock = 100;
        let currentTime = Math.floor(Date.now() / 1000);


        console.log("BLNCS: ", await SGTContractInstance.balanceOf(accounts[1]), await SGTContractInstance.balanceOf(LT4RInstance.address));

        await SGTContractInstance.approve(LT4RInstance.address, amountToLock, {
            from: accounts[1]
        });
        const reputationBeforeLock = await ReputationInstance.balanceOf.call(accounts[1]);

        let lockerBeforeLock = await LT4RInstance.lockers(accounts[1]);
        await LT4RInstance.lock(amountToLock, stakingTime, {
            from: accounts[1]
        });
        const reputationAfterLock = await ReputationInstance.balanceOf.call(accounts[1]);
        let totalLocked = await LT4RInstance.totalLocked();
        let lockerAfterLock = await LT4RInstance.lockers(accounts[1]);

        console.log(totalLocked.toNumber(), "\n\n***\n\n", lockerAfterLock.amount.toNumber(), lockerAfterLock.releaseTime.toNumber(), stakingTime + currentTime)

        assert.strictEqual(
            lockerAfterLock.releaseTime.toNumber(),
            stakingTime + currentTime,
            "Bad release time"
        );
        assert.strictEqual(
            reputationAfterLock.sub(reputationBeforeLock).toNumber(),
            amountToLock,
            "Bad reputation amount"
        );
        assert.strictEqual(
            lockerAfterLock.amount.sub(lockerBeforeLock.amount).toNumber(),
            amountToLock,
            "Bad staked amount"
        );
        assert.strictEqual(
            totalLocked,
            amountToLock + 200,
            "Bad total lock"
        );
    });

});