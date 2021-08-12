import { reporters } from 'mocha';
import * as moment from 'moment';
import { TestRail } from './testrail';
import { titleToCaseIds } from './shared';
import { Status, TestRailResult } from './testrail.interface';
import { TestRailValidation } from './testrail.validation';
const TestRailCache = require('./testrail.cache');
const TestRailLogger = require('./testrail.logger');
const chalk = require('chalk');
var runCounter = 1;

export class CypressTestRailReporter extends reporters.Spec {
  private results: TestRailResult[] = [];
  private testRailApi: TestRail;
  private testRailValidation: TestRailValidation;
  private runId: number;
  private reporterOptions: any;
  private suiteId: any = [];
  private serverTestCaseIds: any = [];

  constructor(runner: any, options: any) {
    super(runner);

    this.reporterOptions = options.reporterOptions;

    if (process.env.CYPRESS_TESTRAIL_REPORTER_USERNAME) {
      this.reporterOptions.username = process.env.CYPRESS_TESTRAIL_REPORTER_USERNAME;
    }

    if (process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD) {
      this.reporterOptions.password = process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD;
    }

    if (process.env.CYPRESS_TESTRAIL_REPORTER_RUNNAME) {
      this.reporterOptions.runName = process.env.CYPRESS_TESTRAIL_REPORTER_RUNNAME;
    }

    if (process.env.CYPRESS_TESTRAIL_REPORTER_GROUPID) {
      this.reporterOptions.runName = process.env.CYPRESS_TESTRAIL_REPORTER_GROUPID;
    }

    this.testRailApi = new TestRail(this.reporterOptions);
    this.testRailValidation = new TestRailValidation(this.reporterOptions);

    /**
     * This will validate reporter options defined in cypress.json file
     * if we are passing suiteId as a part of this file than we assign value to variable
     * usually this is the case for single suite projects
     */
    this.testRailValidation.validateReporterOptions(this.reporterOptions);
    if (this.reporterOptions.suiteId) {
      this.suiteId = this.reporterOptions.suiteId
    }
    /**
     * This will validate runtime environment variables
     * if we are passing suiteId as a part of runtime env variables we assign that value to variable
     * usually we use this way for multi suite projects
     */
    const cliArguments = this.testRailValidation.validateCLIArguments();
    if (cliArguments && cliArguments.length) {
      this.suiteId = cliArguments
    }

    /**
     * If no suiteId has been passed with previous two methods
     * runner will not be triggered
     */
    if (this.suiteId && this.suiteId.toString().length) {
      runner.on('start', () => {
        this.serverTestCaseIds = this.testRailApi.getCases(this.suiteId);
        /**
        * runCounter is used to count how many spec files we have during one run
        * in order to wait for close test run function
        */
        TestRailCache.store('runCounter', runCounter);
        /**
        * creates a new TestRail Run
        * unless a cached value already exists for an existing TestRail Run in
        * which case that will be used and no new one created.
        */
        if (!TestRailCache.retrieve('runId')) {
            if (this.reporterOptions.suiteId) {
              TestRailLogger.log(`Following suiteId has been set in cypress.json file: ${this.suiteId}`);
            }
            const executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
            const name = `${this.reporterOptions.runName || 'Automated test run'} ${executionDateTime}`;
            if (this.reporterOptions.disableDescription) {
              var description = '';
            } else {
              if (process.env.CYPRESS_CI_JOB_URL) {
                var description = process.env.CYPRESS_CI_JOB_URL;
              } else {
                var description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
              }
            }
            TestRailLogger.log(`Creating TestRail Run with name: ${name}`);
            this.testRailApi.createRun(name, description, this.suiteId);
        } else {
            // use the cached TestRail Run ID
            this.runId = TestRailCache.retrieve('runId');
            TestRailLogger.log(`Using existing TestRail Run with ID: '${this.runId}'`);
        }
      });

      runner.on('pass', test => {
        this.submitResults(Status.Passed, test, `Execution time: ${test.duration}ms`);
      });

      runner.on('fail', (test, err) => {
        this.submitResults(Status.Failed, test, `${err.message}`);
      });

      runner.on('retry', test => {
        this.submitResults(Status.Retest, test, 'Cypress retry logic has been triggered!');
      });

      runner.on('end', () => {
        /**
         * When we reach final number of spec files 
         * we should close test run at the end
         */
        var numSpecFiles = this.testRailValidation.countTestSpecFiles();
        var counter = TestRailCache.retrieve('runCounter');
        // load runId before purging testrail-cache.txt
        this.runId = TestRailCache.retrieve('runId');

        if (numSpecFiles.length > counter) {
          runCounter++
        } else {
          this.testRailApi.closeRun();
          /**
           * Remove testrail-cache.txt file at the end of execution
           */
          TestRailCache.purge();
        }

        /**
         * Notify about the results at the end of execution
         */
        if (this.results.length == 0) {
          TestRailLogger.warn('No testcases were matched with TestRail. Ensure that your tests are declared correctly and titles contain matches to format of Cxxxx');
        } else {
          var path = `runs/view/${this.runId}`;
          TestRailLogger.log(`Results are published to ${chalk.magenta(`${this.reporterOptions.host}/index.php?/${path}`)}`);
        }
      });
    }
  }

  /**
   * Ensure that after each test results are reported continuously
   * Additionally to that if test status is failed or retried there is possibility 
   * to upload failed screenshot for easier debugging in TestRail
   * Note: Uploading of screenshot is configurable option
   */
  public submitResults (status, test, comment) {
    let caseIds = titleToCaseIds(test.title)
    const invalidCaseIds = caseIds.filter(caseId => !this.serverTestCaseIds.includes(caseId));
    caseIds = caseIds.filter(caseId => this.serverTestCaseIds.includes(caseId))
    if (invalidCaseIds.length > 0)
      TestRailLogger.log(`The following test IDs were found in Cypress tests, but not found in Testrail: ${invalidCaseIds}`)

    if (caseIds.length) {
      const caseResults = caseIds.map(caseId => {
        return {
          case_id: caseId,
          status_id: status,
          comment: comment,
        };
      });
      this.results.push(...caseResults);
      const publishedResults = this.testRailApi.publishResults(caseResults)
      if (
        publishedResults !== undefined &&
        this.reporterOptions.allowFailedScreenshotUpload === true &&
        (status === Status.Failed || status === Status.Retest)
      ) {
        publishedResults.forEach((result) => {
          this.testRailApi.uploadScreenshots(caseIds[0], result.id);
        })
      }
    }
  }
}
