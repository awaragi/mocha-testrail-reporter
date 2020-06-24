const axios = require('axios');
const chalk = require('chalk');
import { TestRailOptions, TestRailResult } from './testrail.interface';

export class TestRail {
  private base: String;
  private runId: Number;
  private includeALL: Boolean;
  private caseNumbersArray: Number[];

  constructor(private options: TestRailOptions) {
    this.base = `https://${options.domain}/index.php?/api/v2`;
  }

  public getCases () {
    return axios({
      method:'get',
      url: `${this.base}/get_cases/${this.options.projectId}&suite_id=${this.options.suiteId}&section_id=${this.options.groupId}&filter=${this.options.filter}`,
      headers: { 'Content-Type': 'application/json' }, 
      auth: {
          username: this.options.username,
          password: this.options.password
      } 
    })
      .then(response => response.data.map(item =>item.id))
      .catch(error => console.error(error));
  }

  public async createRun (name: string, description: string) {
    var slef = this;
    slef.includeALL = true;
    slef.caseNumbersArray = [];
    if(this.options.includeAllInTestRun === false){
      slef.caseNumbersArray =  await slef.getCases();
      slef.includeALL = false;
    }  
    axios({
      method: 'post',
      url: `${this.base}/add_run/${this.options.projectId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
      data: JSON.stringify({
        suite_id: this.options.suiteId,
        name,
        description,
        include_all: slef.includeALL,
        case_ids: slef.caseNumbersArray
      }),
    })
      .then(response => {
        this.runId = response.data.id;
      })
      .catch(error => console.error(error));
  }

  public deleteRun() {
    axios({
      method: 'post',
      url: `${this.base}/delete_run/${this.runId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
    }).catch(error => console.error(error));
  }

  public publishResults(results: TestRailResult[]) {
    axios({
      method: 'post',
      url: `${this.base}/add_results_for_cases/${this.runId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
      data: JSON.stringify({ results }),
    })
      .then(response => {
        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
        console.log(
          '\n',
          ` - Results are published to ${chalk.magenta(
            `https://${this.options.domain}/index.php?/runs/view/${this.runId}`
          )}`,
          '\n'
        );
      })
      .catch(error => console.error(error));
  }
}
