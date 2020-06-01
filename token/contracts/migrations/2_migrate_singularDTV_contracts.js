const SingularDTVToken = artifacts.require("SingularDTVToken");
const SingularDTVFund = artifacts.require("SingularDTVFund");

module.exports = function (deployer, network, accounts) {
    console.log(`Singular deploy accounts:`);
    console.log(accounts);


    deployer.deploy(SingularDTVFund).then(() => deployer.deploy(SingularDTVToken, SingularDTVFund.address, '0xb1B2a95FC8815C341b684400227c3F3B1F43C376', 'SingularDTV', 'SNGLS', 100, accounts, ["1000000000000000000000000", "900000000000000000000000", "800000000000000000000000", "777000000000000000000000", "600000000000000000000000", "500000000000000000000000", "400000000000000000000000", "300000000000000000000000", "200000000000000000000000", "100000000000000000000000"]));
};