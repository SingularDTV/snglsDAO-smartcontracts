const MembershipFeeStakingContract = artifacts.require("MembershipFeeStaking");
const sgtTokenContract = artifacts.require("DAOToken");

contract("MembershipFeeStakingContract", async accounts => {

    let sgtTokenContractInstance;
    let MemFeeContractInstance;

    it("deploy contracts", async () => {
        sgtTokenContractInstance = await sgtTokenContract.new("SGT token", "SGT", 10000000);
        MemFeeContractInstance = await MembershipFeeStakingContract.new();
    });

    // let minPeriod = 0;
    let minPeriod = 604800;
    it("initialize first time", async () => {
        await MemFeeContractInstance.initialize(sgtTokenContractInstance.address, minPeriod, {
            from: accounts[0]
        });

        let MinPeriod = await MemFeeContractInstance.minLockingPeriod();
        let sgtToken = await MemFeeContractInstance.sgtToken();

        assert.equal(
            MinPeriod.toNumber(),
            minPeriod,
            "Wrong min period"
        );
        assert.equal(
            sgtTokenContractInstance.address,
            sgtToken,
            "Wrong SGT token address"
        );
    });

    it("initialize twice test", async () => {

        let errorRaised = undefined;

        try {
            await MemFeeContractInstance.initialize(sgtTokenContractInstance.address, 5000, {
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
        assert.equal(
            MinPeriod.toNumber(),
            minPeriod,
            "Min period rewrited"
        );
    });

    // // todo: test with other tokens too
    // // todo: call unlock | lock from not staker (only owner can unstake / stake)

    it("should stake tokens", async () => {

        let stakingTime = 700000;
        let amountToLock = 2000;


        await sgtTokenContractInstance.mint(accounts[1], amountToLock + 2000, {
            from: accounts[0]
        });


        await sgtTokenContractInstance.approve(MemFeeContractInstance.address, amountToLock, {
            from: accounts[1]
        });
        await MemFeeContractInstance.lock(amountToLock, stakingTime, {
            from: accounts[1]
        });

        let totalLocked = await MemFeeContractInstance.totalLocked();
        let lockers = await MemFeeContractInstance.lockers(accounts[1]);


        // todo: add balances check 

        let currentTime = Math.floor(Date.now() / 1000);

        assert.equal(
            lockers.releaseTime.toNumber(),
            stakingTime + currentTime,
            "Bad release time"
        );
        assert.equal(
            lockers.amount.toNumber(),
            amountToLock,
            "Bad staked amount"
        );
        assert.equal(
            totalLocked,
            amountToLock,
            "Bad total lock"
        );
    });

    it("should stake tokens", async () => {

        let stakingTime = 900000;
        let amountToLock = 1000;



        await sgtTokenContractInstance.approve(MemFeeContractInstance.address, amountToLock, {
            from: accounts[1]
        });
        await MemFeeContractInstance.lock(amountToLock, stakingTime, {
            from: accounts[1]
        });

        let totalLocked = await MemFeeContractInstance.totalLocked();
        let lockers = await MemFeeContractInstance.lockers(accounts[1]);


        // todo: add balances check 

        let currentTime = Math.floor(Date.now() / 1000);

        assert.equal(
            lockers.releaseTime.toNumber(),
            stakingTime + currentTime,
            "Bad release time"
        );
        assert.equal(
            lockers.amount.toNumber(),
            amountToLock + 2000,
            "Bad staked amount"
        );
        assert.equal(
            totalLocked,
            amountToLock + 2000,
            "Bad total lock"
        );
    });
    const masterAccount = accounts[0];
    it(`User is able to stake and release`, async () => {
        // const sgtTokenContractInstance = await SGTContract.at(await getDeployedAddress("DAOToken"));
        // const MemFeeContractInstance = await MembershipFeeStaking.at(await getDeployedAddress("MembershipFeeStaking"));
        sgtTokenContractInstance = await sgtTokenContract.new("SGT token", "SGT", 10000000);
        MemFeeContractInstance = await MembershipFeeStakingContract.new();
        let lockTime = 0;
        MemFeeContractInstance.initialize(sgtTokenContractInstance.address, lockTime);
        const amount = 1000;
        await sgtTokenContractInstance.mint(masterAccount, amount);

        const tokensBeforeLock = await sgtTokenContractInstance.balanceOf.call(masterAccount);

        await sgtTokenContractInstance.approve(MemFeeContractInstance.address, amount);


        await MemFeeContractInstance.lock(amount, lockTime);

        const tokensAfterLock = await sgtTokenContractInstance.balanceOf.call(masterAccount);

        assert.strictEqual(tokensAfterLock.sub(tokensBeforeLock).toNumber(), -amount, "Wrong tokens balance after locking.")

        await MemFeeContractInstance.release(masterAccount);

        const tokensAfterRelease = await sgtTokenContractInstance.balanceOf.call(masterAccount);

        assert(tokensAfterRelease.eq(tokensBeforeLock), "Wrong tokens balance after release");
    });
});