const SingularDTVToken = artifacts.require("SingularDTVToken");
const SingularDTVFund = artifacts.require("SingularDTVFund");

module.exports = function (deployer) {
    deployer.deploy(SingularDTVFund).then(() => deployer.deploy(SingularDTVToken, SingularDTVFund.address, '0xb1B2a95FC8815C341b684400227c3F3B1F43C376', 'SingularDTV', 'SNGLS', 100));
};