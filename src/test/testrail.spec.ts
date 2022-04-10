import { TestRail } from "../lib/testrail";
import { TestRailCase, Status } from "../lib/testrail.interface";

describe("TestRail API", () => {
  it("Publish test run", (done) => {
    let testRail = new TestRail({
      domain: process.env.TESTRAIL_DOMAIN,
      username: process.env.TESTRAIL_USERNAME,
      password: process.env.TESTRAIL_PASSWORD,
      projectId: process.env.TESTRAIL_PROJECTID,
      suiteId: process.env.TESTRAIL_SUITEID,
      assignedToId: process.env.TESTRAIL_ASSIGNEDTOID,
    });

    testRail.fetchCases({}, (cases: TestRailCase[]) => {
      console.log(cases);
      cases.forEach((value) => {
        console.log(value.id, "-", value.title);
      });
    });

    testRail.publish(
      "Unit Test of mocha-testrail-reporter",
      "Unit Test of mocha-testrail-reporter",
      [
        {
          case_id: 1,
          status_id: Status.Passed,
          comment: "Passing....",
        },
        {
          case_id: 2,
          status_id: Status.Passed,
        },
        {
          case_id: 3,
          status_id: Status.Failed,
          comment: "Failure....",
        },
      ],
      () => {
        done();
      }
    );
  });
});
