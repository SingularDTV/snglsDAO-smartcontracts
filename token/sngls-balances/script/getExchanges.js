let tableToObj = function (table) {
    var trs = table.rows,
        trl = trs.length,
        i = 0,
        j = 0,
        keys = [],
        obj, ret = [];

    for (; i < trl; i++) {
        if (i == 0) {
            for (; j < trs[i].children.length; j++) {
                keys.push(trs[i].children[j].innerHTML);
            }
        } else {
            obj = {};
            for (j = 0; j < trs[i].children.length; j++) {
                obj[keys[j]] = trs[i].children[j].innerHTML;
            }
            ret.push(obj);
        }
    }
    console.log(ret[0])
    console.log(JSON.stringify(ret.filter(val => val.Address.match(/>0x[^<]*</)).map(val => ({
        address: val.Address.match(/>(0x[^<]*)</)[1],
        tag: val["Name Tag"]
    })), null, 4))
    return ret;
};