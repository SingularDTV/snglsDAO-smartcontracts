const specFile = "../data/snglDAOspec.json";

const fs = require("fs")
const path = require("path");
const spec = require(specFile);
const tokenLockingSchemeSearch = spec.CustomSchemes.filter(scheme => scheme.name === "ContinuousLocking4Reputation");
if (tokenLockingSchemeSearch.length > 1) throw new Error("There more than one scheme with 'ContinuousLocking4Reputation'");
else if (tokenLockingSchemeSearch.length === 0) throw new Error("There no 'ContinuousLocking4Reputation' contract found")
else if (tokenLockingSchemeSearch.length === 1) {
    const tokenLockingScheme = tokenLockingSchemeSearch[0];
    // set start time to current unix timestamp
    tokenLockingScheme.params[1] = Math.floor(Date.now() / 1000);
    //    redeem start time      =          start time          +           batch time
    tokenLockingScheme.params[3] = tokenLockingScheme.params[1] + tokenLockingScheme.params[2];
    fs.writeFileSync(path.resolve(__dirname, specFile), JSON.stringify(spec, null, 4));
}