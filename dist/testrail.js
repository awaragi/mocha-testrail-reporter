"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("unirest");
/**
 * TestRail basic API wrapper
 */
var TestRail = /** @class */ (function () {
    function TestRail(options) {
        this.options = options;
        // compute base url
        this.base = "https://" + options.domain + "/index.php";
    }
    TestRail.prototype._post = function (api, body, callback, error) {
        var req = request('POST', this.base)
            .query("/api/v2/" + api)
            .headers({
            'content-type': 'application/json',
        })
            .type('json')
            .send(body)
            .auth(this.options.username, this.options.password)
            .end(function (res) {
            if (res.error) {
                console.log('Error: %s', JSON.stringify(res.body));
                if (error) {
                    error(res.error);
                }
                else {
                    throw new Error(res.error);
                }
            }
            callback(res.body);
        });
    };
    TestRail.prototype._get = function (api, callback, error) {
        var req = request('GET', this.base)
            .query("/api/v2/" + api)
            .headers({
            'content-type': 'application/json',
        })
            .type('json')
            .auth(this.options.username, this.options.password)
            .end(function (res) {
            if (res.error) {
                console.log('Error: %s', JSON.stringify(res.body));
                if (error) {
                    error(res.error);
                }
                else {
                    throw new Error(res.error);
                }
            }
            callback(res.body);
        });
    };
    /**
     * Fetchs test cases from projet/suite based on filtering criteria (optional)
     * @param {{[p: string]: number[]}} filters
     * @param {Function} callback
     */
    TestRail.prototype.fetchCases = function (filters, callback) {
        var filter = '';
        if (filters) {
            for (var key in filters) {
                if (filters.hasOwnProperty(key)) {
                    filter += '&' + key + '=' + filters[key].join(',');
                }
            }
        }
        var req = this._get("get_cases/" + this.options.projectId + "&suite_id=" + this.options.suiteId + filter, function (body) {
            if (callback) {
                callback(body);
            }
        });
    };
    /**
     * Publishes results of execution of an automated test run
     * @param {string} name
     * @param {string} description
     * @param {TestRailResult[]} results
     * @param {Function} callback
     */
    TestRail.prototype.publish = function (name, description, results, callback) {
        var _this = this;
        console.log("Publishing " + results.length + " test result(s) to " + this.base);
        this._post("add_run/" + this.options.projectId, {
            suite_id: this.options.suiteId,
            name: name,
            description: description,
            assignedto_id: this.options.assignedToId,
            include_all: true,
        }, function (body) {
            var runId = body.id;
            console.log("Results published to " + _this.base + "?/runs/view/" + runId);
            _this._post("add_results_for_cases/" + runId, {
                results: results,
            }, function (body) {
                // execute callback if specified
                if (callback) {
                    callback();
                }
            });
        });
    };
    return TestRail;
}());
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map