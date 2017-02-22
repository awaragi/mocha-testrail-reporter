import {TestRail} from "../lib/testrail";

describe.skip("TestRail API", () => {
    it("Publish test run", (done) => {
        new TestRail({
            domain: "testingoutone",
            username: "testingout.one@mailinator.com",
            password: "XyMp8uojG3wkzNNNXiTk-dP4MnBmOiQhVC2xGvmyY",
            projectId: 1,
            suiteId: 2,
            assignedToId: 1,
        }).publish(0, 0, 0, ["test 1: pass", "test 2: fail"], [
            {
                caseId: 74,
                pass: true
            }, {
                caseId: 75,
                pass: false,
                comment: "Failure...."
            }
        ], done);
    })
});