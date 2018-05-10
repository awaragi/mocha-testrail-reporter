import { reporters } from 'mocha';
import * as moment from 'moment';
import { TestRail } from './testrail';
import { titleToCaseIds } from './shared';
import { Status, TestRailResult } from './testrail.interface';

export class CypressTestRailReporter extends reporters.Spec {
  private results: TestRailResult[] = [];
  private passes: number = 0;
  private fails: number = 0;
  private pending: number = 0;
  private durationInMs: number = 0;

  constructor(runner: any, options: any) {
    super(runner);

    let reporterOptions = options.reporterOptions;
    this.validate(reporterOptions, 'domain');
    this.validate(reporterOptions, 'username');
    this.validate(reporterOptions, 'password');
    this.validate(reporterOptions, 'projectId');
    this.validate(reporterOptions, 'suiteId');

    runner.on('start', () => {});

    runner.on('suite', suite => {});

    runner.on('suite end', () => {});

    runner.on('pending', test => {
      this.pending++;
    });

    runner.on('pass', test => {
      this.passes++;
      this.durationInMs += test.duration;
      let caseIds = titleToCaseIds(test.title);
      if (caseIds.length > 0) {
        let results = caseIds.map(caseId => {
          return {
            case_id: caseId,
            status_id: Status.Passed,
            comment: `Execution time: ${test.duration}ms`,
          };
        });
        this.results.push(...results);
      }
    });

    runner.on('fail', test => {
      this.fails++;
      this.durationInMs += test.duration;
      let caseIds = titleToCaseIds(test.title);
      if (caseIds.length > 0) {
        let results = caseIds.map(caseId => {
          return {
            case_id: caseId,
            status_id: Status.Failed,
            comment: `${test.err.message}`,
          };
        });
        this.results.push(...results);
      }
    });

    runner.on('end', () => {
      if (this.results.length == 0) {
        console.warn(
          'No testcases were matched. Ensure that your tests are declared correctly and matches TCxxx'
        );
        return;
      }
      let executionDateTime = moment().format('MMM Do YYYY, HH:mm');
      let totalCases = this.passes + this.fails + this.pending;
      const totalDuration = moment().set('millisecond', this.durationInMs).format('mm min ss sec')
      let name = `${reporterOptions.runName || 'Automated test run'} ${executionDateTime}`;
      let description = `Automated test run executed on ${executionDateTime}
Execution summary:
Duration: ${totalDuration}
Passes: ${this.passes}
Fails: ${this.fails}
Pending: ${this.pending}
Total: ${totalCases}`;
      new TestRail(reporterOptions).publish(name, description, this.results);
    });
  }

  private validate(options, name: string) {
    if (options == null) {
      throw new Error('Missing reporterOptions in cypress.json');
    }
    if (options[name] == null) {
      throw new Error(`Missing ${name} value. Please update reporterOptions in cypress.json`);
    }
  }
}
