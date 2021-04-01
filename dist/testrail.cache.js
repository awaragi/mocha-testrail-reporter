var fs = require('fs');
var cacheFileName = 'testrail-cache.txt';
var cacheData = {};
var fileExists = function () {
    return fs.existsSync(cacheFileName);
};
var createFile = function () {
    fs.writeFileSync(cacheFileName, '');
};
var persist = function () {
    fs.writeFileSync(cacheFileName, JSON.stringify(cacheData), {
        flag: 'w'
    });
};
var load = function () {
    if (!fileExists()) {
        createFile();
    }
    var dataStr = fs.readFileSync(cacheFileName);
    if (dataStr && dataStr != '') {
        cacheData = JSON.parse(dataStr);
    }
    else {
        cacheData = {};
    }
};
var TestRailCache = {
    store: function (key, val) {
        cacheData[key] = val;
        persist();
    },
    retrieve: function (key) {
        load();
        return cacheData[key];
    },
    purge: function () {
        if (fileExists()) {
            fs.unlink(cacheFileName, function (err) {
                if (err)
                    throw err;
            });
        }
        cacheData = {};
    }
};
module.exports = TestRailCache;
//# sourceMappingURL=testrail.cache.js.map