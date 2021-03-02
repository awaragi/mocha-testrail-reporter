import { reporters } from 'mocha';
import * as moment from 'moment';
import { TestRail } from './testrail';
import { titleToCaseIds } from './shared';
import { Status, TestRailResult } from './testrail.interface';
import { TestRailValidation } from './testrail.validation';
const chalk = require('chalk');

export class CypressTestRailReporter extends reporters.Spec {
  private results: TestRailResult[] = [];
  private testRailApi: TestRail;
  private testRailValidation: TestRailValidation;
  private runId: number;
  private reporterOptions: any;

  constructor(runner: any, options: any) {
    super(runner);

    var runCounter = 1;
    let reporterOptions = options.reporterOptions;

    if (process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD) {
      reporterOptions.password = process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD;
    }

    this.testRailApi = new TestRail(reporterOptions);
    this.testRailValidation = new TestRailValidation(reporterOptions);

    TestRailCache.store('runCounter', runCounter);
    this.testRailValidation.validateReporterOptions(reporterOptions);
    const cliArguments = this.testRailValidation.validateCLIArguments();

    if (cliArguments.length == 0 && reporterOptions.suiteId) {
      // skip reporter and don't start runner
    } else {
      runner.on('start', () => {
        /**
        * creates a new TestRail Run
        * unless a cached value already exists for an existing TestRail Run in
        * which case that will be used and no new one created.
        */
        if (!TestRailCache.retrieve('runId')) {
            if (reporterOptions.suiteId) {
              var suiteId = reporterOptions.suiteId
            } else {
              var suiteId = cliArguments
            }
            const executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
            const name = `${reporterOptions.runName || 'Automated test run'} ${executionDateTime}`;
            const description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
            TestRailLogger.log(`Creating TestRail Run with name: ${name}`);
            this.testRailApi.createRun(name, description, suiteId);
        } else {
            // use the cached TestRail Run ID
            this.runId = TestRailCache.retrieve('runId');
            TestRailLogger.log(`Using existing TestRail Run with ID: '${this.runId}'`);
        }
      });

      runner.on('pass', test => {
        this.submitResults(Status.Passed, test, `Execution time: ${test.duration}ms`);
      });

      runner.on('fail', test, err => {
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
          TestRailLogger.log(`Results are published to ${chalk.magenta(`https://${this.reporterOptions.domain}/index.php?/${path}`)}`);
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
          if (this.reporterOptions.allowFailedScreenshotUpload && this.reporterOptions.allowFailedScreenshotUpload === true) {
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
        })
      });
    }
  }
}
