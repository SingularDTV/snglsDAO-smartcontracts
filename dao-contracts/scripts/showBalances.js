const DAOToken = artifacts.require("DAOToken");
const getDeployedAddress = require("./../test/getDeployedAddress")
contract("Show-balances script", async accounts => {
    it(`Balances:`, async () => {
        let tokenInstance;
        tokenInstance = await DAOToken.at(await getDeployedAddress("DAOToken"));
        //set blue font color
        console.log("\x1b[34m");
        for (let i = 0; i < accounts.length; i++) {
            const acc = accounts[i];
            console.log(`${acc}: ${(await tokenInstance.balanceOf.call(acc)).toString()}`);
        }

        //reset font color
        console.log("\x1b[0m");

        console.log(await tokenInstance.getPastEvents("allEvents", {
            fromBlock: 0
        }));
    })
})