import btoa = require('btoa');
import unirest = require("unirest");

export class TestRail {
    private base: String;

    constructor(private options: TestRailOptions) {
        // compute base url
        this.base = `https://${options.domain}/index.php`;
    }

    private _post(api: String, body: any, callback: Function, error?: Function) {
        var req = unirest("POST", this.base)
            .query(`/api/v2/${api}`)
            .headers({
                "content-type": "application/json"
            })
            .type("json")
            .send(body)
            .auth(this.options.username, this.options.password)
            .end((res) => {
                if (res.error) {
                    console.log("Error: %s", JSON.stringify(res.body));
                    if (error) {
                        error(res.error);
                    } else {
                        throw new Error(res.error);
                    }
                }
                callback(res.body);
            });
    }

    publish(passes: number, fails: number, pending: number, out: string[], tests: TestCase[], callback?: Function): void {
        let total = passes + fails + pending;
        let results: any = [];
        for (let test of tests) {
            results.push({
                "case_id": test.caseId,
                "status_id": test.pass ? 1 : 5,
                "comment": test.comment ? test.comment: "",
            });
        }

        console.log(`Publishing ${results.length} test result(s) to ${this.base}`)
        let executionDateTime = new Date().toISOString();
        this._post(`add_run/${this.options.projectId}`, {
            "suite_id": this.options.suiteId,
            "name": `Automated test run ${executionDateTime}`,
            "description": `Automated test run executed on ${executionDateTime}
Execution summary:
Passes: ${passes}
Fails: ${fails}
Pending: ${pending}
Total: ${total}

Execution details:
${out.join('\n')}                     
`,
            "assignedto_id": this.options.assignedToId,
            "include_all": true
        }, (body) => {
            const runId = body.id
            console.log(`Results published to ${this.base}?/runs/view/${runId}`)
            this._post(`add_results_for_cases/${runId}`, {
                results: results
            }, (body) => {
                // execute callback if specified
                if(callback) {
                    callback();
                }
            })
        });
    }
}
