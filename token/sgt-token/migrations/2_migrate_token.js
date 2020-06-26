const SGToken = artifacts.require("SGToken");

module.exports = function (deployer) {
    deployer.deploy(SGToken);
};