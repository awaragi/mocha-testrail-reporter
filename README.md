# TestRail Reporter for Cypress

[![version](https://img.shields.io/npm/v/cypress-testrail-reporter.svg)](https://www.npmjs.com/package/cypress-testrail-reporter)
[![downloads](https://img.shields.io/npm/dt/cypress-testrail-reporter.svg)](https://www.npmjs.com/package/cypress-testrail-reporter)
[![MIT License](https://img.shields.io/github/license/Vivify-Ideas/cypress-testrail-reporter.svg)](https://github.com/Vivify-Ideas/cypress-testrail-reporter/blob/master/LICENSE.md)

Publishes [Cypress](https://www.cypress.io/) runs on TestRail. 

Core features:

* Test results are aggregated under the same test run if you are executing more spec(test) files and they are belongs to the same suite
* Results are reported immediately after single test execution (real-time reporting)
* Test run would be closed after last spec(test) file has been finished
* Possibility to upload screenshots for failed and retried test cases - optional (**allowFailedScreenshotUpload: true**)
* Multi suite project support (set **suiteId=1** in **cypress.json** or set it as a part of runtime environment variables as **testRailSuiteId=1**)
* Reporting retest status of a test cases - handy in terms of marking tests as flaky (test is reported with retest status for the first try and after second try it passes) Note: cypress retry logic must be enabled for this feature.  


## Install

```shell
$ npm install cypress-testrail-reporter --save-dev
```

## Usage

Add reporter to your `cypress.json`:

```json
...
"reporter": "cypress-testrail-reporter",
"reporterOptions": {
  "host": "https://yourdomain.testrail.com",
  "username": "username",
  "password": "password",
  "projectId": 1,
  "suiteId": 1,
}
```

Your Cypress tests should include the ID of your TestRail test case. Make sure your test case IDs are distinct from your test titles:

```Javascript
// Good:
it("C123 C124 Can authenticate a valid user", ...
it("Can authenticate a valid user C321", ...

// Bad:
it("C123Can authenticate a valid user", ...
it("Can authenticate a valid userC123", ...
```

## Reporter Options

**host**: _string_ host of your TestRail instance (e.g. for a hosted instance _https://instance.testrail.com_).

**username**: _string_ email of the user under which the test run will be created. When you set `CYPRESS_TESTRAIL_REPORTER_USERNAME` in
environment variables, this option would be overwritten with it.

**password**: _string_ password or the API key for the aforementioned user. When you set `CYPRESS_TESTRAIL_REPORTER_PASSWORD` in runtime environment variables, this option would be overwritten with it.

**projectId**: _number_ project with which the tests are associated.

**suiteId**: _number_ suite with which the tests are associated. Optional under **cypress.json** file in case that you define **suiteId** under **gitlab-ci.yml** file or set this value in runtime environment varables.

**runName**: _string_ (optional) name of the Testrail run. When you set `CYPRESS_TESTRAIL_REPORTER_RUNNAME` in runtime environment variables, this option would be overwritten with it.

**disableDescription**: _bool_ (optional: default is false) possibility to disable description for test run in case that someone don’t have cypress dashboard feature (_disableDescription: true_)

**allowFailedScreenshotUpload**: _bool_ (optional: default is false) will upload failed screenshot to corresponding test result comment for easier debugging of failure.

**includeAllInTestRun**: _bool_ (optional: default is true) will return all test cases in test run. set to false to return test runs based on filter or section/group.

**groupId**: _string_ (optional: needs "includeAllInTestRun": false ) The ID of the section/group. When you set `CYPRESS_TESTRAIL_REPORTER_GROUPID` in runtime environment variables, this option would be overwritten with it.

**filter**: _string_ (optional: needs "includeAllInTestRun": false) Only return cases with matching filter string in the case title

## Multiple suite

This reporter can handle multiple suite project in TestRail. In order to use it, don't define **suiteId** under **cypress.json** file and instead you should pass **testRailSuiteId** variable when you define all other CLI agruments for cypress execution(through command line). If you are using CI integration solution (e.g. GitLab) **testRailSuiteId** can be set before every pipeline job or predefined for each spec (test) file for which suiteId belongs to.

**gitlab-ci.yml** file (Here you can pass **suiteId** as a variable):

```Javascript

e2e_test1:
  script: 
    - e2e-setup.sh
  variables:
    CYPRESS_SPEC: "cypress/integration/dashboard/*"
    TESTRAIL_SUITEID: 1

e2e_test2:
  script: 
    - e2e-setup.sh
  variables:
    CYPRESS_SPEC: "cypress/integration/login/*"
    TESTRAIL_SUITEID: 2
```

and use it later during cypress run:

**e2e-setup.sh** file

```Javascript

CYPRESS_OPTIONS="baseUrl=${url},trashAssetsBeforeRuns=false,video=${video},screenshotOnRunFailure=${screenshotOnRunFailure}"
CYPRESS_ENV="testRailSuiteId=${TESTRAIL_SUITEID}"

npx cypress run --headed --browser chrome --config "${CYPRESS_OPTIONS}" --env="${CYPRESS_ENV}" --spec "${CYPRESS_SPEC}"
```

## Cucumber preprocessor

This reporter can miss spec files if they are suffixed as **.feature** or if you are not using the default **cypress/integration** folder. In order to use it with the Cucumber Preprocess, you should pass the location of your spec files **cypress/tests/\*\*/\*.feature** when you define all other CLI agruments for cypress execution(through command line). If you are using CI integration solution (e.g. GitLab) **CYPRESS_SPEC** can be set before every pipeline job

```Javascript

CYPRESS_SPEC="cypress/tests/**/*.feature"

npx cypress run --headed --browser chrome --spec "${CYPRESS_SPEC}"
```

## TestRail Settings

To increase security, the TestRail team suggests using an API key instead of a password. You can see how to generate an API key [here](http://docs.gurock.com/testrail-api2/accessing#username_and_api_key).

If you maintain your own TestRail instance on your own server, it is recommended to [enable HTTPS for your TestRail installation](http://docs.gurock.com/testrail-admin/admin-securing#using_https).

For TestRail hosted accounts maintained by [Gurock](http://www.gurock.com/), all accounts will automatically use HTTPS.

You can read the whole TestRail documentation [here](http://docs.gurock.com/).

## Author

Milutin Savovic - [github](https://github.com/mickosav)

## Core contributors

* [Anes Topcic](https://github.com/sakalaca)
* [FFdhorkin](https://github.com/FFdhorkin)

## License

This project is licensed under the [MIT license](/LICENSE.md).

## Acknowledgments

* [Pierre Awaragi](https://github.com/awaragi), owner of the [mocha-testrail-reporter](https://github.com/awaragi/mocha-testrail-reporter) repository that was forked.
* [Valerie Thoma](https://github.com/ValerieThoma) and [Aileen Santos](https://github.com/asantos3026) for proofreading the README.md file and making it more understandable.
