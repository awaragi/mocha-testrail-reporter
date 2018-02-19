import {TestRail} from "../lib/testrail";
import {TestRailResult, TestRailCase, Status} from "../lib/testrail.interface";

describe("TestRail API", () => {
    it("Publish test run on current Run ID", (done) => {
        let testRail = new TestRail({
            domain: process.env.DOMAIN,
            username: process.env.USERNAME,
            password: process.env.PASSWORD,
            projectId: process.env.PROJECT_ID,
            runId: process.env.RUN_ID
        });

        testRail.publish("Unit Test of mocha-testrail-reporter", "Unit Test of mocha-testrail-reporter", [{
            case_id: process.env.CASE_1,
            status_id: Status.Passed,
            comment: "Passing...."
        }, {
            case_id: process.env.CASE_2,
            status_id: Status.Passed
        }, {
            case_id: process.env.CASE_3,
            status_id: Status.Passed
        }, {
            case_id: process.env.CASE_4,
            status_id: Status.Failed,
            comment: "Failure...."
        }], done);
    });

    it("Publish test run on new Run ID", (done) => {
        let testRail = new TestRail({
            domain: process.env.DOMAIN,
            username: process.env.USERNAME,
            password: process.env.PASSWORD,
            projectId: process.env.PROJECT_ID,
            suiteId: process.env.SUITE_ID,
        });

        testRail.fetchCases({type_id: [3], priority_id: [4]}, (cases: TestRailCase[]) => {
            console.log(cases);
            let results: TestRailResult
            cases.forEach((value => {
                console.log(value.id, value.title);
            }));
        });

        testRail.publish("Unit Test of mocha-testrail-reporter", "Unit Test of mocha-testrail-reporter", [{
            case_id: process.env.CASE_ID_1,
            status_id: Status.Passed,
            comment: "Passing...."
        }, {
            case_id: process.env.CASE_ID_2,
            status_id: Status.Passed
        }, {
            case_id: process.env.CASE_ID_3,
            status_id: Status.Passed
        }, {
            case_id: process.env.CASE_ID_4,
            status_id: Status.Failed,
            comment: "Failure...."
        }], done);
    });
});