"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRail = void 0;
var axios = require('axios');
var deasync = require('deasync');
var fs = require('fs');
var path = require('path');
var FormData = require('form-data');
var TestRailLogger = require('./testrail.logger');
var TestRailCache = require('./testrail.cache');
var TestRail = /** @class */ (function () {
    function TestRail(options) {
        this.options = options;
        this.includeAll = true;
        this.caseIds = [];
        this.base = options.host + "/index.php?/api/v2";
        this.runId;
    }
    /**
     * To work around a Cypress issue where Mocha exits before async requests
     * finish, we use the deasync library to ensure our axios promises
     * actually complete. For more information, see:
     * https://github.com/cypress-io/cypress/issues/7139
     * @param promise A `finally` condition will be appended to this promise, enabling a deasync loop
     */
    TestRail.prototype.makeSync = function (promise) {
        var _this = this;
        var done = false;
        var result = undefined;
        (function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, promise.finally(function () { return done = true; })];
                case 1: return [2 /*return*/, result = _a.sent()];
            }
        }); }); })();
        deasync.loopWhile(function () { return !done; });
        return result;
    };
    TestRail.prototype.getCases = function (suiteId) {
        var url = this.base + "/get_cases/" + this.options.projectId + "&suite_id=" + suiteId;
        if (this.options.groupId) {
            url += "&section_id=" + this.options.groupId;
        }
        if (this.options.filter) {
            url += "&filter=" + this.options.filter;
        }
        if (this.options.typeId) {
            url += "&type_id=" + this.options.typeId;
        }
        return this.makeSync(axios({
            method: 'get',
            url: url,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password
            }
        })
            .then(function (response) {
            return response.data.map(function (item) { return item.id; });
        })
            .catch(function (error) { return console.error(error); }));
    };
    TestRail.prototype.createRun = function (name, description, suiteId) {
        var _this = this;
        if (this.options.includeAllInTestRun === false) {
            this.includeAll = false;
            this.caseIds = this.getCases(suiteId);
        }
        this.makeSync(axios({
            method: 'post',
            url: this.base + "/add_run/" + this.options.projectId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({
                suite_id: suiteId,
                name: name,
                description: description,
                include_all: this.includeAll,
                case_ids: this.caseIds
            }),
        })
            .then(function (response) {
            _this.runId = response.data.id;
            // cache the TestRail Run ID
            TestRailCache.store('runId', _this.runId);
        })
            .catch(function (error) { return console.error(error); }));
    };
    TestRail.prototype.deleteRun = function () {
        this.runId = TestRailCache.retrieve('runId');
        this.makeSync(axios({
            method: 'post',
            url: this.base + "/delete_run/" + this.runId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        }).catch(function (error) { return console.error(error); }));
    };
    TestRail.prototype.publishResults = function (results) {
        this.runId = TestRailCache.retrieve('runId');
        return this.makeSync(axios({
            method: 'post',
            url: this.base + "/add_results_for_cases/" + this.runId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({ results: results }),
        })
            .then(function (response) { return response.data; })
            .catch(function (error) {
            console.error(error);
        }));
    };
    TestRail.prototype.uploadAttachment = function (resultId, path) {
        var form = new FormData();
        form.append('attachment', fs.createReadStream(path));
        this.makeSync(axios({
            method: 'post',
            url: this.base + "/add_attachment_to_result/" + resultId,
            headers: __assign({}, form.getHeaders()),
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: form,
        }));
    };
    // This function will attach failed screenshot on each test result(comment) if founds it
    TestRail.prototype.uploadScreenshots = function (caseId, resultId) {
        var _this = this;
        var SCREENSHOTS_FOLDER_PATH = path.join(__dirname, 'cypress/screenshots');
        fs.readdir(SCREENSHOTS_FOLDER_PATH, function (err, files) {
            if (err) {
                return console.log('Unable to scan screenshots folder: ' + err);
            }
            files.forEach(function (file) {
                if (file.includes("C" + caseId) && /(failed|attempt)/g.test(file)) {
                    try {
                        _this.uploadAttachment(resultId, SCREENSHOTS_FOLDER_PATH + file);
                    }
                    catch (err) {
                        console.log('Screenshot upload error: ', err);
                    }
                }
            });
        });
    };
    ;
    TestRail.prototype.closeRun = function () {
        this.runId = TestRailCache.retrieve('runId');
        this.makeSync(axios({
            method: 'post',
            url: this.base + "/close_run/" + this.runId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        })
            .then(function () {
            TestRailLogger.log('Test run closed successfully');
        })
            .catch(function (error) { return console.error(error); }));
    };
    return TestRail;
}());
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map