let singularContractAddress = require("../../token/contracts/build/contracts/SingularDTVToken.json");
contract("setSNGLSAddress script", accounts => {
    it(``, async () => {
        singularContractAddress = singularContractAddress.networks[await web3.eth.net.getId()].address;
        const specFile = "../data/snglDAOspec.json";

        const fs = require("fs")
        const path = require("path");
        const spec = require(specFile);
        const membershipFeeSearch = spec.StandAloneContracts.filter(scheme => scheme.name === "MembershipFeeStaking");
        if (membershipFeeSearch.length > 1) throw new Error("There more than one scheme with 'ContinuousLocking4Reputation'");
        else if (membershipFeeSearch.length === 0) throw new Error("There no 'ContinuousLocking4Reputation' contract found")
        else if (membershipFeeSearch.length === 1) {
            const membershipFee = membershipFeeSearch[0];
            // set start time to current unix timestamp
            membershipFee.params[0] = singularContractAddress;
            fs.writeFileSync(path.resolve(__dirname, specFile), JSON.stringify(spec, null, 4));
        }
    });
})