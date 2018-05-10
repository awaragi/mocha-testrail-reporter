import { reporters } from 'mocha';
import * as moment from 'moment'
import { TestRail } from './testrail';
import { titleToCaseIds } from './shared';
import { Status, TestRailResult } from './testrail.interface';

export class CypressTestRailReporter extends reporters.Spec {
  private results: TestRailResult[] = [];
  private passes: number = 0;
  private fails: number = 0;
  private pending: number = 0;
  private out: string[] = [];

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
      this.out.push(test.fullTitle() + ': pending');
    });

    runner.on('pass', test => {
      this.passes++;
      this.out.push(test.fullTitle() + ': pass');
      let caseIds = titleToCaseIds(test.title);
      console.dir(test.speed)
      if (caseIds.length > 0) {
        if (test.speed === 'fast') {
          let results = caseIds.map(caseId => {
            return {
              case_id: caseId,
              status_id: Status.Passed,
              comment: test.title,
            };
          });
          this.results.push(...results);
        } else {
          let results = caseIds.map(caseId => {
            return {
              case_id: caseId,
              status_id: Status.Passed,
              comment: `${test.title} (${test.duration}ms)`,
            };
          });
          this.results.push(...results);
        }
      }
    });

    runner.on('fail', test => {
      this.fails++;
      this.out.push(test.fullTitle() + ': fail');
      let caseIds = titleToCaseIds(test.title);
      console.dir(test.err)
      if (caseIds.length > 0) {
        let results = caseIds.map(caseId => {
          return {
            case_id: caseId,
            status_id: Status.Failed,
            comment: `${test.title}
${test.err}`,
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
      let total = this.passes + this.fails + this.pending;
      let name = `${reporterOptions.runName || 'Automated test run'} ${executionDateTime}`;
      let description = `Automated test run executed on ${executionDateTime}
Execution summary:
Passes: ${this.passes}
Fails: ${this.fails}
Pending: ${this.pending}
Total: ${total}

Execution details:
${this.out.join('\n')}                     
`;
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
