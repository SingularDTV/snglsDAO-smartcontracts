const Controller = artifacts.require("Controller");
const Avatar = artifacts.require("Avatar");
const SGTContract = artifacts.require("DAOToken");
const LockingToken4Reputation = artifacts.require("LockingToken4Reputation");
const ReputationContract = artifacts.require("Reputation");
const PriceOracle = artifacts.require("TokenLockingOracle");
const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("LockingToken4Reputation", async accounts => {
    const masterAccount = accounts[0];
    it(`It works`, async () => {
        let PriceOracleInstance = await PriceOracle.deployed();
        let ControllerInstance = await Controller.deployed();
        let AvatarInstance = await Avatar.deployed();
        let SGTContractInstance = await SGTContract.deployed();
        let LT4RInstance = await LockingToken4Reputation.deployed();
        let ReputationInstance = ReputationContract.deployed();
        // await AgreementInstance.setAgreementHash();

        // await LT4RInstance.initialize(AvatarInstance.address, 1, 1585724514, 2147483647, 1, 100, PriceOracleInstance.address, "0x0");
        // function initialize(
        //     Avatar _avatar,
        //     uint256 _reputationReward,
        //     uint256 _lockingStartTime,
        //     uint256 _lockingEndTime,
        //     uint256 _redeemEnableTime,
        //     uint256 _maxLockingPeriod,
        //     PriceOracleInterface _priceOracleContract,
        //     bytes32 _agreementHash)
        const amount = 1000;
        await SGTContractInstance.mint(masterAccount, amount);
        await SGTContractInstance.approve(LT4RInstance.address, amount);
        await LT4RInstance.lock(amount, 1, SGTContractInstance.address, "0x0");
        await increaseTime(100);
        assert.strictEqual((await LT4RInstance.redeem.call(masterAccount)).toNumber(), amount, "Wrong redeem reputation");
        await assert.doesNotReject(LT4RInstance.redeem(masterAccount));

    });
})

function increaseTime(addSeconds) {
    const id = Date.now();

    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'evm_increaseTime',
            params: [addSeconds],
            id,
        }, (err1) => {
            if (err1) return reject(err1);

            web3.currentProvider.send({
                jsonrpc: '2.0',
                method: 'evm_mine',
                id: id + 1,
            }, (err2, res) => (err2 ? reject(err2) : resolve(res)));
        });
    });
}