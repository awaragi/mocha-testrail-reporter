const axios = require('axios');
const find = require('find');
const request = require('request');
const fs = require('fs');
const TestRailLogger = require('./testrail.logger');
const TestRailCache = require('./testrail.cache');
import { TestRailOptions, TestRailResult } from './testrail.interface';

export class TestRail {
  private base: String;
  private runId: Number;
  private includeAll: Boolean = true;
  private caseIds: Number[] = [];
  public attempt: number;
  private retries: number;

  constructor(private options: TestRailOptions) {
    this.base = `${options.host}/index.php?/api/v2`;
    this.runId;
    this.attempt = 1;
  }

  public getCases () {
    let url = `${this.base}/get_cases/${this.options.projectId}&suite_id=${this.options.suiteId}`
    if (this.options.groupId) {
      url += `&section_id=${this.options.groupId}`
    }
    if (this.options.filter) {
      url += `&filter=${this.options.filter}`
    }
    return axios({
      method:'get',
      url: url,
      headers: { 'Content-Type': 'application/json' }, 
      auth: {
          username: this.options.username,
          password: this.options.password
      } 
    })
    .then(response => response.data.map(item =>item.id))
    .catch(error => console.error(error));
  }

  public async createRun (name: string, description: string, suiteId: number) {
    if (this.options.includeAllInTestRun === false){
      this.includeAll = false;
      this.caseIds =  await this.getCases();
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
        suite_id: suiteId,
        name,
        description,
        include_all: this.includeAll,
        case_ids: this.caseIds
      }),
    })
    .then(response => {
        this.runId = response.data.id;
        // cache the TestRail Run ID
        TestRailCache.store('runId', this.runId);
    })
    .catch(error => console.error(error));
  }

  public deleteRun() {
    this.runId = TestRailCache.retrieve('runId');
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
    this.runId = TestRailCache.retrieve('runId');
    return axios({
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
      return response.data
    })
    .catch(error => { 
      return console.error(error); 
    });
  }

  // This is an API call to the TestRail with proper attachment
  public loadAttachment (resultId, attachment) {
    const options = {
      method: "POST",
      url: this.base + "/add_attachment_to_result/" + resultId,
      headers: {
          "Content-Type": "multipart/form-data"
      },
      auth: {
          username: this.options.username,
          password: this.options.password,
      },
      formData: {
          "attachment": fs.createReadStream(`./${attachment}`)
      }
    };

    request(options, function (err) {
      if (err) console.log(err);
    })
  }

  // This function will attach failed screenshot on each test result(comment) if founds it
  public addAttachmentToResult (results, loadedResultId) {
    const caseId = results[0].case_id;
    const storedCaseId = TestRailCache.retrieve('caseId');
    /**
     * This will ensure that we reset number of retries to the starting value
     * when execution of current case is done, so that we can upload screenshots 
     * which are related to the current test execution
    */
    if (caseId != storedCaseId) {
      this.attempt = 1;
    }
    /**
     * Based on those two regex we are searching for failed screenshot
     * If retry cypress feature is enabled it will search for each
     * failed attempt and upload to corresponding test result (instead aggregating under the same result comment)
     */
    const regex1 = new RegExp(/(\W|^)failed(\W|^).png/g);
    const regex2 = new RegExp('attempt ' + this.attempt, 'g');
    try {
      find.file('./cypress/screenshots/', (files) => {
        files.filter(file => file.includes(`C${caseId}`)).forEach(screenshot => {
          switch(true) {
            case (regex1.test(screenshot) && this.attempt == 1):
              this.loadAttachment(loadedResultId, screenshot);
              this.attempt++
              break;
            case (regex2.test(screenshot)):
              this.loadAttachment(loadedResultId, screenshot);
              this.attempt++
              break;
          }
        })
      });
    } catch (err) {
      console.log('Error on adding screenshots. There is no screenshots or something else went wrong.', err)
    }
  };

  public closeRun() {
    this.runId = TestRailCache.retrieve('runId');
    axios({
      method: 'post',
      url: `${this.base}/close_run/${this.runId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
    })
    .then(() => {
        TestRailLogger.log('Test run closed successfully');
    })
    .catch(error => console.error(error));
  }
}
