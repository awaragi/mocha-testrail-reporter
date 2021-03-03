import { reporters } from 'mocha';
import * as moment from 'moment';
import { TestRail } from './testrail';
import { titleToCaseIds } from './shared';
import { Status, TestRailResult } from './testrail.interface';
import { TestRailValidation } from './testrail.validation';
var TestRailCache = require('./testrail.cache');
var TestRailLogger = require('./testrail.logger');
const chalk = require('chalk');
var runCounter = 1;

export class CypressTestRailReporter extends reporters.Spec {
  private results: TestRailResult[] = [];
  private testRailApi: TestRail;
  private testRailValidation: TestRailValidation;
  private runId: number;
  private reporterOptions: any;
  private suiteId: any;

  constructor(runner: any, options: any) {
    super(runner);

    this.reporterOptions = options.reporterOptions;

    if (process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD) {
      this.reporterOptions.password = process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD;
    }

    this.testRailApi = new TestRail(this.reporterOptions);
    this.testRailValidation = new TestRailValidation(this.reporterOptions);

    TestRailCache.store('runCounter', runCounter);
    this.testRailValidation.validateReporterOptions(this.reporterOptions);
    const cliArguments = this.testRailValidation.validateCLIArguments();

    if (cliArguments == undefined || cliArguments.length == 0) {
      if (!this.reporterOptions.suiteId) {
        // skip reporter and don't start runner
        TestRailLogger.warn('Reporter did not found a value of suiteId. Report will be skipped. If this is intentional please ignore.');
        this.suiteId = [];
      } else { this.suiteId = this.reporterOptions.suiteId }
    } else { this.suiteId = cliArguments }

    if (this.suiteId.length != 0) {
      runner.on('start', () => {
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
              if (this.reporterOptions.disableDescription === true) {
                var description = '';
              }
            } else {
              var description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
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
        if (numSpecFiles.length > counter) {
          runCounter++
        } else {
          this.testRailApi.closeRun();
        }

        /**
         * Notify about the results at the end of execution
         */
        if (this.results.length == 0) {
          TestRailLogger.warn('No testcases were matched with TestRail. Ensure that your tests are declared correctly and titles contain matches to format of Cxxxx');
        } else {
          this.runId = TestRailCache.retrieve('runId');
          var path = `runs/view/${this.runId}`;
          TestRailLogger.log(`Results are published to ${chalk.magenta(`https://${this.reporterOptions.host}/index.php?/${path}`)}`);
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
    const caseIds = titleToCaseIds(test.title);
    if (caseIds.length > 0) {
      var caseResults = caseIds.map(caseId => {
        return {
          case_id: caseId,
          status_id: status,
          comment: comment,
        };
      });
    }
    if (caseResults === undefined) {
      //Do nothing since no tests were matched with TestRail
    } else {
      this.results.push(...caseResults);
      var caseStatus = caseResults[0].status_id
      Promise.all(caseResults).then(() => {
        this.testRailApi.publishResults(caseResults).then(loadedResults => {
          if (this.reporterOptions.allowFailedScreenshotUpload) {
            if(this.reporterOptions.allowFailedScreenshotUpload === true) {
              if(caseStatus === Status.Failed || caseStatus === Status.Retest) {
                try {
                  loadedResults.forEach((loadedResult) => {
                    this.testRailApi.addAttachmentToResult(caseResults, loadedResult['id']);
                  })
                } catch (err) {
                  console.log('Error on adding attachments for loaded results', err)
                }
              } else {
                this.testRailApi.counter = 1
              }
            }
          }
        })
      });
    }
  }
}
