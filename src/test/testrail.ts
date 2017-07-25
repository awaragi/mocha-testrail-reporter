import {TestRail} from "../lib/testrail";
import {TestRailResult, TestRailCase, Status} from "../lib/testrail.interface";

describe("TestRail API", () => {
    it("Publish test run", (done) => {
        let testRail = new TestRail({
            domain: process.env.DOMAIN,
            username: process.env.USERNAME,
            password: process.env.PASSWORD,
            projectId: 10,
            suiteId: 104,
            // assignedToId: 2,
        });

        testRail.fetchCases({type_id: [3], priority_id: [4]}, (cases: TestRailCase[]) => {
            console.log(cases);
            let results: TestRailResult
            cases.forEach((value => {
                console.log(value.id, value.title);
            }));
        });

        testRail.publish("Unit Test of mocha-testrail-reporter", "Unit Test of mocha-testrail-reporter", [{
            case_id: 3033,
            status_id: Status.Passed,
            comment: "Passing...."
        }, {
            case_id: 3034,
            status_id: Status.Passed
        }, {
            case_id: 3035,
            status_id: Status.Passed
        }, {
            case_id: 3036,
            status_id: Status.Failed,
            comment: "Failure...."
        }], done);
    });
});