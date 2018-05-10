import { reporters } from 'mocha';
import * as moment from 'moment';
import { TestRail } from './testrail';
import { titleToCaseIds } from './shared';
import { Status, TestRailResult } from './testrail.interface';

export class CypressTestRailReporter extends reporters.Spec {
  private results: TestRailResult[] = [];
  private passes: number = 0;
  private fails: number = 0;
  private durationInMs: number = 0;

  constructor(runner: any, options: any) {
    super(runner);

    let reporterOptions = options.reporterOptions;
    this.validate(reporterOptions, 'domain');
    this.validate(reporterOptions, 'username');
    this.validate(reporterOptions, 'password');
    this.validate(reporterOptions, 'projectId');
    this.validate(reporterOptions, 'suiteId');

    runner.on('hook end', hook => {
      this.durationInMs += hook.duration;
    });

    runner.on('pass', test => {
      this.passes++;
      this.durationInMs += test.duration;
      const caseIds = titleToCaseIds(test.title);
      if (caseIds.length > 0) {
        const results = caseIds.map(caseId => {
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
      const caseIds = titleToCaseIds(test.title);
      if (caseIds.length > 0) {
        const results = caseIds.map(caseId => {
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
      const executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
      const totalCases = this.passes + this.fails;
      const momentDuration = moment.duration(this.durationInMs);
      const totalDuration = `${
        momentDuration.hours() ? momentDuration.hours() + ' hours ' : ''
      }${momentDuration.minutes()} min ${momentDuration.seconds()} sec`;
      const name = `${reporterOptions.runName || 'Automated test run'} ${executionDateTime}`;
      const description = `For the full details visit https://dashboard.cypress.io/#/projects/runs
**Execution summary:**
  - Duration: ${totalDuration}
  - Passed: ${this.passes}
  - Failed: ${this.fails}
  - Total: ${totalCases}`;
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
