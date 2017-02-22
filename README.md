#Testrails Reporter for Mocha

Pushes test results into TestRail system.

## Installation

```shell
$ npm install mocha-testrail-reporter --save-dev
```

## Usage
Run mocha with `mocha-testrail-reporter`:

```shell
$ mocha test --reporter mocha-testrail-reporter --reporter-options domain=example,username=test@example.com,password=12345678,projectId=1,suiteId=1
```
all reporter-options are mandatory except the following:

- assignedToId


Reference: https://github.com/michaelleeallen/mocha-testrail-reporter/blob/master/index.js