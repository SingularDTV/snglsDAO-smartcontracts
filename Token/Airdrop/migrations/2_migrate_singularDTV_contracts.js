const SingularDTVToken = artifacts.require("SingularDTVToken");
const SingularDTVFund = artifacts.require("SingularDTVFund");
const SGToken = artifacts.require("SGToken");

module.exports = function (deployer, network, accounts) {
    deployer.deploy(SingularDTVFund).then(() => deployer.deploy(SingularDTVToken, SingularDTVFund.address, accounts[0], 'SingularDTV', 'SNGLS', 100));
    deployer.deploy(SGToken, 1000);
};