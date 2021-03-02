"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var mocha_1 = require("mocha");
var moment = require("moment");
var testrail_1 = require("./testrail");
var shared_1 = require("./shared");
var testrail_interface_1 = require("./testrail.interface");
var testrail_validation_1 = require("./testrail.validation");
var chalk = require('chalk');
var CypressTestRailReporter = /** @class */ (function (_super) {
    __extends(CypressTestRailReporter, _super);
    function CypressTestRailReporter(runner, options) {
        var _this = _super.call(this, runner) || this;
        _this.results = [];
        var runCounter = 1;
        var reporterOptions = options.reporterOptions;
        if (process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD) {
            reporterOptions.password = process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD;
        }
        _this.testRailApi = new testrail_1.TestRail(reporterOptions);
        _this.testRailValidation = new testrail_validation_1.TestRailValidation(reporterOptions);
        TestRailCache.store('runCounter', runCounter);
        _this.testRailValidation.validateReporterOptions(reporterOptions);
        var cliArguments = _this.testRailValidation.validateCLIArguments();
        if (cliArguments.length == 0 && reporterOptions.suiteId) {
            // skip reporter and don't start runner
        }
        else {
            runner.on('start', function () {
                /**
                * creates a new TestRail Run
                * unless a cached value already exists for an existing TestRail Run in
                * which case that will be used and no new one created.
                */
                if (!TestRailCache.retrieve('runId')) {
                    if (reporterOptions.suiteId) {
                        var suiteId = reporterOptions.suiteId;
                    }
                    else {
                        var suiteId = cliArguments;
                    }
                    var executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
                    var name_1 = (reporterOptions.runName || 'Automated test run') + " " + executionDateTime;
                    var description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
                    TestRailLogger.log("Creating TestRail Run with name: " + name_1);
                    _this.testRailApi.createRun(name_1, description, suiteId);
                }
                else {
                    // use the cached TestRail Run ID
                    _this.runId = TestRailCache.retrieve('runId');
                    TestRailLogger.log("Using existing TestRail Run with ID: '" + _this.runId + "'");
                }
            });
            runner.on('pass', function (test) {
                _this.submitResults(testrail_interface_1.Status.Passed, test, "Execution time: " + test.duration + "ms");
            });
            runner.on('fail', test, function (err) {
                _this.submitResults(testrail_interface_1.Status.Failed, test, "" + err.message);
            });
            runner.on('retry', function (test) {
                _this.submitResults(testrail_interface_1.Status.Retest, test, 'Cypress retry logic has been triggered!');
            });
            runner.on('end', function () {
                /**
                 * When we reach final number of spec files
                 * we should close test run at the end
                 */
                var numSpecFiles = _this.testRailValidation.countTestSpecFiles();
                var counter = TestRailCache.retrieve('runCounter');
                if (numSpecFiles.length > counter) {
                    runCounter++;
                }
                else {
                    _this.testRailApi.closeRun();
                }
                /**
                 * Notify about the results at the end of execution
                 */
                if (_this.results.length == 0) {
                    TestRailLogger.warn('No testcases were matched with TestRail. Ensure that your tests are declared correctly and titles contain matches to format of Cxxxx');
                }
                else {
                    _this.runId = TestRailCache.retrieve('runId');
                    var path = "runs/view/" + _this.runId;
                    TestRailLogger.log("Results are published to " + chalk.magenta("https://" + _this.reporterOptions.domain + "/index.php?/" + path));
                }
            });
        }
        return _this;
    }
    /**
     * Ensure that after each test results are reported continuously
     * Additionally to that if test status is failed or retried there is possibility
     * to upload failed screenshot for easier debugging in TestRail
     * Note: Uploading of screenshot is configurable option
     */
    CypressTestRailReporter.prototype.submitResults = function (status, test, comment) {
        var _this = this;
        var caseIds = shared_1.titleToCaseIds(test.title);
        if (caseIds.length > 0) {
            var caseResults = caseIds.map(function (caseId) {
                return {
                    case_id: caseId,
                    status_id: status,
                    comment: comment,
                };
            });
        }
        if (caseResults === undefined) {
            //Do nothing since no tests were matched with TestRail
        }
        else {
            (_a = this.results).push.apply(_a, caseResults);
            var caseStatus = caseResults[0].status_id;
            Promise.all(caseResults).then(function () {
                _this.testRailApi.publishResults(caseResults).then(function (loadedResults) {
                    if (_this.reporterOptions.allowFailedScreenshotUpload && _this.reporterOptions.allowFailedScreenshotUpload === true) {
                        if (caseStatus === testrail_interface_1.Status.Failed || caseStatus === testrail_interface_1.Status.Retest) {
                            try {
                                loadedResults.forEach(function (loadedResult) {
                                    _this.testRailApi.addAttachmentToResult(caseResults, loadedResult['id']);
                                });
                            }
                            catch (err) {
                                console.log('Error on adding attachments for loaded results', err);
                            }
                        }
                        else {
                            _this.testRailApi.counter = 1;
                        }
                    }
                });
            });
        }
        var _a;
    };
    return CypressTestRailReporter;
}(mocha_1.reporters.Spec));
exports.CypressTestRailReporter = CypressTestRailReporter;
//# sourceMappingURL=cypress-testrail-reporter.js.map