import {reporters} from 'mocha';
import {TestRail} from "./testrail";
import {titleToCaseIds} from "./shared";


export class MochaTestRailReporter extends reporters.Spec {
    private testCases: TestCase[] = [];
    private passes: number = 0;
    private fails: number = 0;
    private pending: number = 0;
    private out: string[] = [];

    constructor(runner: any, options: any) {
        super(runner);

        let reporterOptions: TestRailOptions = <TestRailOptions>options.reporterOptions;
        this.validate(reporterOptions, 'domain');
        this.validate(reporterOptions, 'username');
        this.validate(reporterOptions, 'password');
        this.validate(reporterOptions, 'projectId');
        this.validate(reporterOptions, 'suiteId');

        runner.on('start', () => {
        });

        runner.on('suite', (suite) => {
        });

        runner.on('suite end', () => {
        });

        runner.on('pending', (test) => {
            this.pending++;
            this.out.push(test.fullTitle() + ': pending');
        });

        runner.on('pass', (test) => {
            this.passes++;
            this.out.push(test.fullTitle() + ': pass');
            let caseIds = titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                if (test.speed === 'fast') {
                    let testCases = caseIds.map(caseId => {
                        return {
                            caseId: caseId,
                            pass: true,
                            comment: test.title
                        };
                    });
                    this.testCases.push(...testCases);
                } else {
                    let testCases = caseIds.map(caseId => {
                        return {
                            caseId: caseId,
                            pass: true,
                            comment: `${test.title} (${test.duration}ms)`
                        };
                    });
                    this.testCases.push(...testCases);
                }
            }
        });

        runner.on('fail', (test) => {
            this.fails++;
            this.out.push(test.fullTitle() + ': fail');
            let caseIds = titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                let testCases = caseIds.map(caseId => {
                    return {
                        caseId: caseId,
                        pass: false,
                        comment: `${test.title}
${test.err}`
                    };
                });
                this.testCases.push(...testCases);
            }
        });

        runner.on('end', () => {
            if (this.testCases.length == 0) {
                console.warn("No testcases were matched. Ensure that your tests are declared correctly and matches TCxxx");
            }
            new TestRail(reporterOptions).publish(this.passes, this.fails, this.pending, this.out, this.testCases);
        });
    }

    private validate(options: TestRailOptions, name: string) {
        if (options == null) {
            throw new Error("Missing --reporter-options in mocha.opts");
        }
        if (options[name] == null) {
            throw new Error(`Missing ${name} value. Please update --reporter-options in mocha.opts`);
        }
    }
}
