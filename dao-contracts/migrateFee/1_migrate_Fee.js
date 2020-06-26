var Fee = artifacts.require("Fee");

module.exports = function (deployer) {
    deployer.deploy(Fee,
        "100000000000000000000",
        "1000000000000000000",
        "100000000000000000000",
        "1500000000000000000000");
};