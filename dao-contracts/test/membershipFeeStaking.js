const MembershipFeeStakingContract = artifacts.require("MembershipFeeStaking");
const snglsTokenContract = artifacts.require("DAOToken");

contract("MembershipFeeStakingContract", async accounts => {
    const BN = web3.utils.BN;
    let snglsTokenContractInstance;
    let MemFeeContractInstance;

    it("deploy contracts", async () => {
        snglsTokenContractInstance = await snglsTokenContract.new("SNGLS token", "SNGLS", 10000000);
        MemFeeContractInstance = await MembershipFeeStakingContract.new();
    });

    // let minPeriod = 0;
    let minPeriod = 604800;
    it("initialize first time", async () => {
        await MemFeeContractInstance.initialize(snglsTokenContractInstance.address, minPeriod, {
            from: accounts[0]
        });

        let MinPeriod = await MemFeeContractInstance.minLockingPeriod();
        let sgtToken = await MemFeeContractInstance.sgtToken();
        let totalLocked = await MemFeeContractInstance.totalLocked();
        assert.strictEqual(
            totalLocked.toNumber(),
            0,
            "Wrong totalLocked"
        );
        assert.strictEqual(
            MinPeriod.toString(),
            minPeriod.toString(),
            "Wrong min period"
        );
        assert.strictEqual(
            snglsTokenContractInstance.address,
            sgtToken,
            "Wrong SGT token address"
        );
    });

    it("initialize twice test", async () => {

        let errorRaised = undefined;

        try {
            await MemFeeContractInstance.initialize(snglsTokenContractInstance.address, 5000, {
                from: accounts[1]
            })
        } catch (error) {
            errorRaised = error;
        }

        let MinPeriod = await MemFeeContractInstance.minLockingPeriod();

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
            minPeriod,
            "Min period rewritten"
        );
        let totalLocked = await MemFeeContractInstance.totalLocked();
        assert.strictEqual(
            totalLocked.toNumber(),
            0,
            "totalLocked  rewritten"
        );
    });

    // // todo: test with other tokens too
    // // todo: call unlock | lock from not staker (only owner can unstake / stake)

    it("should stake tokens", async () => {

        let stakingTime = 700000;
        let amountToLock = 2000;


        await snglsTokenContractInstance.mint(accounts[1], amountToLock + 2000, {
            from: accounts[0]
        });


        await snglsTokenContractInstance.approve(MemFeeContractInstance.address, amountToLock, {
            from: accounts[1]
        });
        await MemFeeContractInstance.lock(amountToLock, stakingTime, {
            from: accounts[1]
        });

        let totalLocked = await MemFeeContractInstance.totalLocked();
        let lockers = await MemFeeContractInstance.lockers(accounts[1]);


        // todo: add balances check 

        let currentTime = Math.floor(Date.now() / 1000);

        assert.strictEqual(
            lockers.releaseTime.toNumber(),
            stakingTime + currentTime,
            "Bad release time"
        );
        assert.strictEqual(
            lockers.amount.toNumber(),
            amountToLock,
            "Bad staked amount"
        );
        assert.strictEqual(
            totalLocked.toString(),
            amountToLock.toString(),
            "Bad total lock"
        );
    });

    it("should stake tokens", async () => {

        let stakingTime = 900000;
        let amountToLock = 1000;



        await snglsTokenContractInstance.approve(MemFeeContractInstance.address, amountToLock, {
            from: accounts[1]
        });
        await MemFeeContractInstance.lock(amountToLock, stakingTime, {
            from: accounts[1]
        });

        let totalLocked = await MemFeeContractInstance.totalLocked();
        let lockers = await MemFeeContractInstance.lockers(accounts[1]);


        // todo: add balances check 

        let currentTime = Math.floor(Date.now() / 1000);

        assert.strictEqual(
            lockers.releaseTime.toNumber(),
            stakingTime + currentTime,
            "Bad release time"
        );
        assert.strictEqual(
            lockers.amount.toNumber(),
            amountToLock + 2000,
            "Bad staked amount"
        );
        assert.strictEqual(
            totalLocked.toNumber(),
            amountToLock + 2000,
            "Bad total lock"
        );
    });
    const masterAccount = accounts[0];
    it(`User is able to stake and release`, async () => {
        // const sgtTokenContractInstance = await SGTContract.at(await getDeployedAddress("DAOToken"));
        // const MemFeeContractInstance = await MembershipFeeStaking.at(await getDeployedAddress("MembershipFeeStaking"));
        snglsTokenContractInstance = await snglsTokenContract.new("SGT token", "SGT", 10000000);
        MemFeeContractInstance = await MembershipFeeStakingContract.new();
        let lockTime = 0;
        MemFeeContractInstance.initialize(snglsTokenContractInstance.address, lockTime);
        const amount = 1000;
        await snglsTokenContractInstance.mint(masterAccount, amount);

        const tokensBeforeLock = await snglsTokenContractInstance.balanceOf.call(masterAccount);

        await snglsTokenContractInstance.approve(MemFeeContractInstance.address, amount);

        let totalLockedBefore = await MemFeeContractInstance.totalLocked();
        await MemFeeContractInstance.lock(amount, lockTime);
        let totalLockedAfter = await MemFeeContractInstance.totalLocked();

        const tokensAfterLock = await snglsTokenContractInstance.balanceOf.call(masterAccount);

        assert.strictEqual(tokensAfterLock.sub(tokensBeforeLock).toNumber(), -amount, "Wrong tokens balance after locking.")
        assert.strictEqual(
            totalLockedAfter.toString(),
            totalLockedBefore.addn(amount).toString(),
            "Bad total lock"
        );
        totalLockedBefore = totalLockedAfter;
        await MemFeeContractInstance.release();
        totalLockedAfter = await MemFeeContractInstance.totalLocked();
        assert.strictEqual(
            totalLockedAfter.toString(),
            totalLockedBefore.subn(amount).toString(),
            "Bad total lock"
        );
        const tokensAfterRelease = await snglsTokenContractInstance.balanceOf.call(masterAccount);

        assert(tokensAfterRelease.eq(tokensBeforeLock), "Wrong tokens balance after release");
        assert.strictEqual(
            totalLockedAfter.toString(),
            totalLockedBefore.sub(new BN(amount)).toString(),
            "Bad total lock"
        );
    });
});