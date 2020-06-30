const DaoCreator = artifacts.require("DaoCreator");
const migrations = require("../migration.json")
const assert = require("assert").strict;

module.exports = function (deployer, network) {
  console.log(`network -- ${network}`);
  if (network === "development") {
    network = "private";
  }
  if (network === "rinkeby-fork") {
    network = "rinkeby";
  }
  const ControllerCreator = migrations[network].base["0.0.1-rc.32"].ControllerCreator;
  const DAOTracker = migrations[network].base["0.0.1-rc.32"].DAOTracker;
  assert(ControllerCreator)
  assert(DAOTracker)
  deployer.deploy(DaoCreator, ControllerCreator, DAOTracker);

};