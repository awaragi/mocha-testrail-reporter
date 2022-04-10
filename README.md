#Testrail Reporter for Mocha

[![npm version](https://badge.fury.io/js/mocha-testrail-reporter.svg)](https://badge.fury.io/js/mocha-testrail-reporter)

Pushes test results into Testrail system.

> **NOTE** : Version 2.0.x is backward compatible with v1 but has been updated to latest dependencies. The V2 choice is to ensure that existing users are not affected!

## Installation

```shell
$ npm install mocha-testrail-reporter --save-dev
```

## Usage
Ensure that your testrail installation API is enabled and generate your API keys. See http://docs.gurock.com/

Run mocha with `mocha-testrail-reporter`:

```shell
$ mocha test --reporter mocha-testrail-reporter --reporter-options domain=instance.testrail.net,username=test@example.com,password=12345678,projectId=1,suiteId=1
```

or use a mocha.options file
```shell
mocha --opts mocha-testrail.opts build/test
--recursive
--reporter mocha-testrail-reporter
--reporter-options domain=instance.testrail.net,username=test@example.com,password=12345678,projectId=1,suiteId=1
--no-exit
```


Mark your mocha test names with ID of Testrail test cases. Ensure that your case ids are well distinct from test descriptions.
 
```Javascript
it("C123 C124 Authenticate with invalid user", () => {})
it("Authenticate a valid user C321", () => {})
```

Only passed or failed tests will be published. Skipped or pending tests will not be published resulting in a "Pending" status in testrail test run.

## Options

**domain**: *string* domain name of your Testrail instance (e.g. for a hosted instance instance.testrail.net)

**username**: *string* user under which the test run will be created (e.g. jenkins or ci)

**password**: *string* password or API token for user

**projectId**: *number* projet number with which the tests are associated

**suiteId**: *number* suite number with which the tests are associated

**assignedToId**: *number* (optional) user id which will be assigned failed tests

## Build and test locally

### Setup testrail test server

- Start a new TestRail trial from https://www.gurock.com/testrail/test-management/
- Enable API under https://XXX.testrail.io/index.php?/admin/site_settings&tab=8
- Add a new project (Use multiple test suites to manage cases)
- Add a new test suite (ids: 1)
- Add at least 4 test cases (ids: C1, C2, C3, C4, etc)
- Once setup, set your environment variables - recommend using .env file in the root folder
  - TESTRAIL_DOMAIN=XXX.testrail.io 
  - TESTRAIL_USERNAME=XXX 
  - TESTRAIL_PASSWORD=XXX 
  - TESTRAIL_PROJECTID=1 
  - TESTRAIL_SUITEID=1 
  - TESTRAIL_ASSIGNEDTOID=1
- Execute the build and test commands (unit and integration tests)
- Execute the e2e test (requires build and .env file)

### Build and test
```
npm run clean
npm run build
npm run test
```

## References
- http://mochajs.org/#mochaopts
- https://github.com/mochajs/mocha/wiki/Third-party-reporters
- http://docs.gurock.com/testrail-api2/start
