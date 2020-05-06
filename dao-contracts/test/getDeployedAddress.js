const migration = require("../data/migration.json");
module.exports = async function getDeployedAddress(contractName) {
    let chainId = await web3.eth.net.getId();
    let network;
    if (chainId === 4) network = "rinkeby";
    else network = "private";
    //"0.0.1-rc.32" - this property can be changed in future
    const singularMigration = migration[network].dao["0.0.1-rc.32"];
    if (singularMigration.hasOwnProperty(contractName)) return singularMigration[contractName];
    else {
        //searching by aliases (not by names), because of the same names (such like a lot of GenericSchemes)
        let schemeObj = singularMigration.Schemes.filter(scheme => (scheme.alias === contractName || scheme.name === contractName));
        if (schemeObj.length === 1) return schemeObj[0].address;
        else if (schemeObj.length > 1) throw new Error(`Found more than one scheme contract with this name/alias ("${contractName}") in migrations. There can ba several scheme contracts with same name, try to use unique aliases instead of names.`);
        else {
            let schemeObj = singularMigration.StandAloneContracts.filter(scheme => (scheme.alias === contractName || scheme.name === contractName));
            if (schemeObj.length === 1) return schemeObj[0].address;
            else if (schemeObj.length > 1) throw new Error(`Found more than one stand alone contract with this name ("${contractName}") in migrations, there must be only one contract with unique name.`);
            else throw new Error(`No contracts found for "${contractName}" name.`)
        }
    }
}