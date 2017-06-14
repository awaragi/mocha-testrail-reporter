#Testrail Reporter for Mocha

[![npm version](https://badge.fury.io/js/mocha-testrail-reporter.svg)](https://badge.fury.io/js/mocha-testrail-reporter)

Pushes test results into Testrail system.

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
it("C123 C124 Authenticate with invalid user", . . .
it("Authenticate a valid user C321", . . .
```

Only passed or failed tests will be published. Skipped or pending tests will not be published resulting in a "Pending" status in testrail test run.

## Options

**domain**: *string* domain name of your Testrail instance (e.g. for a hosted instance instance.testrail.net)

**username**: *string* user under which the test run will be created (e.g. jenkins or ci)

**password**: *string* password or API token for user

**projectId**: *number* projet number with which the tests are associated

**suiteId**: *number* suite number with which the tests are associated

**assignedToId**: *number* (optional) user id which will be assigned failed tests

## References
- http://mochajs.org/#mochaopts
- https://github.com/mochajs/mocha/wiki/Third-party-reporters
- http://docs.gurock.com/testrail-api2/start