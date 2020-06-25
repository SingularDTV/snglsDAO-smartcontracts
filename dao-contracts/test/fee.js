const Avatar = artifacts.require("Avatar");
const GenesisProtocol = artifacts.require("GenesisProtocol");
const Controller = artifacts.require("Controller");
const GenericSchemeContract = artifacts.require("UGenericScheme");
const FeeContract = artifacts.require("Fee");
const getDeployedAddress = require("./getDeployedAddress");
const migration = require("./../data/migration.json")
const assert = require('assert').strict;
const BN = web3.utils.BN;

contract("Fee", async accounts => {
    let GenesisProtocolInstance;
    let GenericSchemeInstance;
    let FeeInstance;
    let avatarAddress;
    before(async () => {
        let chainId = await web3.eth.net.getId();
        let network;
        if (chainId === 4) network = "rinkeby";
        else network = "private";
        //"0.0.1-rc.32" - this property can be changed in future

        FeeInstance = await FeeContract.new(0, 0, 0, 0);

    });
    const feesAndTestValues = {
        "Validation": "9000000000000000000",
        "Listing": "7000000000000000000",
        "Transaction": "8000000000000000000",
        "Membership": "11000000000000000000"
    };
    const feesNames = {
        "Validation": "validation",
        "Listing": "listing",
        "Transaction": "transaction",
        "Membership": "membership"
    }
    let k = 1;
    for (const fee in feesAndTestValues) {
        if (feesAndTestValues.hasOwnProperty(fee)) {
            let testValue = feesAndTestValues[fee];

            it(`Owner is able to set ${fee} fee`, async () => {
                await FeeInstance[`set${fee}Fee`](testValue);
                assert.strictEqual((await FeeInstance[`${feesNames[fee]}Fee`].call()).toString(), testValue, "Expected fee value doesn't equal to on-chain values.");
            });
        }
    }
    it(`Owner is unable to set non-integer membership fee`, async () => {
        let valueBeforeTest = await FeeInstance.membershipFee();
        let testValues = ["1", "110000000000000000001"];
        for (let i = 0; i < testValues.length; i++) {
            const testValue = testValues[i];
            await assert.rejects(FeeInstance.setMembershipFee(testValue), "Setting non-integer membership fee must reject");
            assert.strictEqual((await FeeInstance[`membershipFee`].call()).toString(), valueBeforeTest.toString(), "Expected fee value doesn't equal to on-chain values.");
        }
    })
    it(`Owner is able to set all fees via setFees function`, async () => {
        const testValues = [
            "5000000000000000000",
            "4000000000000000000",
            "3000000000000000000",
            "12000000000000000000"
        ];
        const feesNames = [
            "listing",
            "transaction",
            "validation",
            "membership"
        ]
        await FeeInstance.setFees(...testValues);
        for (let i = 0; i < testValues.length; i++) {
            const testValue = testValues[i];
            const feeName = feesNames[i];
            assert.strictEqual((await FeeInstance[`${feeName}Fee`].call()).toString(), testValue, "Expected fee value doesn't equal to on-chain values.");
        }
    });

    it(`Owner is unable to set non-integer membership fee via setFees function`, async () => {
        let valueBeforeTest = await FeeInstance.membershipFee();
        const testValues = [
            "1000000000000000000",
            "1000000000000000000",
            "1000000000000000000",
            "11000000000000010000"
        ];
        const feesNames = [
            "validation",
            "listing",
            "transaction",
            "membership"
        ]
        await assert.rejects(FeeInstance.setFees(...testValues), "Setting non-integer membership fee must reject");
        for (let i = 0; i < testValues.length; i++) {
            const testValue = testValues[i];
            const feeName = feesNames[i];
            assert.notEqual((await FeeInstance[`${feeName}Fee`].call()).toString(), testValue, "Expected fee value doesn't equal to on-chain values.");
        }
    });

    describe(`Not an owner unable to call any function`, async () => {
        let notOwner = accounts[1];
        const functions = {
            "setValidationFee": ["9000000000000000000"],
            "setListingFee": ["7000000000000000000"],
            "setTransactionFee": ["8000000000000000000"],
            "setMembershipFee": ["11000000000000000000"],
            "setFees": [
                "5000000000000000000",
                "4000000000000000000",
                "3000000000000000000",
                "12000000000000000000"
            ]
        };
        let unnecessary;
        for (const func in functions) {
            if (functions.hasOwnProperty(func)) {
                const arguments = functions[func];
                it(`Unable to call ${func}`, async () => {
                    await assert.rejects(FeeInstance[func](...arguments, {
                        from: notOwner
                    }), "Must be rejected");
                });
            }
        }
    });
    // it(`Proposal is unable to set non-integer membership fee`, async () => {
    //     let fee = "membership";
    //     let feeBefore = (await FeeInstance[`${fee}Fee`].call()).toString();
    //     const testValues = ["1500000000000000000", "500000000000000000", "7", "0"]; //1.5,0.5,0.000..07, 0.0
    //     for (let i = 0; i < testValues.length; i++) {
    //         const testValue = testValues[i];

    //         const proposalId = await GenericSchemeInstance.proposeCall.call(avatarAddress, encodeFeeChangeCall(fee, testValue), 0, `Change ${fee} fee`);
    //         await GenericSchemeInstance.proposeCall(avatarAddress, encodeFeeChangeCall(fee, testValue), 0, `Change ${fee} fee`);
    //         for (let i = 0; i < k; i++) {
    //             const acc = accounts[i];
    //             await GenesisProtocolInstance.vote(proposalId, 1, 0, acc, {
    //                 from: acc
    //             });
    //         }
    //         assert.strictEqual((await FeeInstance[`${fee}Fee`].call()).toString(), feeBefore, `Expected ${fee} fee value doesn't equal to on-chain values.`);
    //     }
    // });
    // it(`Proposal is unable to set non-integer membership fee via setFees function`, async () => {
    //     let fee = "membership";
    //     let feeBefore = (await FeeInstance[`${fee}Fee`].call()).toString();
    //     const testValues = ["1500000000000000000", "500000000000000000", "7"]; //1.5,0.5,0.000..07
    //     for (let i = 0; i < testValues.length; i++) {
    //         const testValue = testValues[i];

    //         const proposalId = await GenericSchemeInstance.proposeCall.call(avatarAddress, encodeSetFeesCall(["9000000000000000000", "9000000000000000000", "9000000000000000000", testValue]), 0, `Change ${fee} fee`);
    //         await GenericSchemeInstance.proposeCall(avatarAddress, encodeSetFeesCall(["9000000000000000000", "9000000000000000000", "9000000000000000000", testValue]), 0, `Change ${fee} fee`);
    //         for (let i = 0; i < k; i++) {
    //             const acc = accounts[i];
    //             console.log("Vote: ",
    //                 await GenesisProtocolInstance.vote(proposalId, 1, 0, acc, {
    //                     from: acc
    //                 }));
    //         }
    //         assert.strictEqual((await FeeInstance[`${fee}Fee`].call()).toString(), feeBefore, `Expected ${fee} fee value doesn't equal to on-chain values.`);
    //     }
    // });
    // it(`Proposal is able to set all fees via setFees function`, async () => {
    //     const fees = [
    //         "validation",
    //         "listing",
    //         "transaction",
    //         "membership"
    //     ];
    //     const testValues = ["1300000000000000000", "2400000000000000000", "3500000000000000000", "4000000000000000000"]; //1.5,0.5,0.000..07, 0.0

    //     const proposalId = await GenericSchemeInstance.proposeCall.call(avatarAddress, encodeSetFeesCall(testValues), 0, `Change all fees`);
    //     await GenericSchemeInstance.proposeCall(avatarAddress, encodeSetFeesCall(testValues), 0, `Change all fees`);
    //     for (let i = 0; i < k; i++) {
    //         const acc = accounts[i];
    //         await GenesisProtocolInstance.vote(proposalId, 1, 0, acc, {
    //             from: acc
    //         });
    //     }
    //     for (let i = 0; i < fees.length; i++) {
    //         const fee = fees[i];
    //         const val = testValues[i];
    //         assert.strictEqual((await FeeInstance[`${fee}Fee`].call()).toString(), val, `Expected ${fee} fee value doesn't equal to on-chain values.`);
    //     }
    // });
});

function encodeSetFeesCall([listingFee, transactionFee, validationFee, membershipFee]) {
    return web3.eth.abi.encodeFunctionCall({
        name: `setFees`,
        type: 'function',
        inputs: [{
                type: 'uint256',
                name: `_listingFee`
            },
            {
                type: 'uint256',
                name: `_transactionFee`
            }, {
                type: 'uint256',
                name: `_validationFee `
            }, {
                type: 'uint256',
                name: `_membershipFee`
            },
        ]
    }, [listingFee, transactionFee, validationFee, membershipFee]);
}

function encodeFeeChangeCall(feeName, newFee) {
    return web3.eth.abi.encodeFunctionCall({
        name: `set${feeName[0].toUpperCase()+feeName.slice(1).toLowerCase()}Fee`,
        type: 'function',
        inputs: [{
            type: 'uint256',
            name: `_${feeName.toLowerCase()}Fee`
        }]
    }, [newFee]);
}