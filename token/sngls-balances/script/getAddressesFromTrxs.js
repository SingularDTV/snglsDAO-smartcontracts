const Papa = require("papaparse");
const fs = require("fs");
let csvString = fs.readFileSync("./tokenSaleTrxs.csv").toString();

Papa.parse(csvString, {
    header: true,
    // dynamicTyping: true,
    complete: function (results) {
        console.log(results.data.length);
        let obj = {};
        let users = results.data.map(v => v.From);
        users.map((val, ind) => {
            if (val)
                obj[val] = true;
        });
        let uniqueUsers = [];
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                uniqueUsers.push(key);
            }
        }
        fs.writeFileSync("./tokenSaleAddressesArray.json", JSON.stringify(uniqueUsers, null, 4));
        console.log("Wrote results to ./tokenSaleAddressesArray.json");

    }
});