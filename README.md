##Testrail Reporter for Cypress

Pushes test results into Testrail system.
Forked from [mocha testrail reporter](https://www.npmjs.com/package/mocha-testrail-reporter)

## Installation

```shell
$ npm i -D cypress-testrail-reporter
```

## Usage

Ensure that your testrail installation API is enabled and generate your API keys. See [Username and API Key](http://docs.gurock.com/testrail-api2/accessing#username_and_api_key)

Add reporter to `cypress.json`:

```json
"reporter": "cypress-testrail-reporter",
"reporterOptions": {
  "domain": "yourdomain.testrail.com",
  "username": "username",
  "password": "password",
  "projectId": 1,
  "suiteId": 1,
  "runName": "Cypress test run"
}
```

Mark your Cypress test names with ID of a Testrail test cases. Ensure that your case ids are well distinct from test descriptions.

```Javascript
it("C123 C124 Authenticate with invalid user", . . .
it("Authenticate a valid user C321", . . .
```

Only passed or failed tests will be published. Skipped or pending tests will not be published resulting in a "Pending" status in testrail test run.

## Options

**domain**: _string_ domain name of your Testrail instance (e.g. for a hosted instance instance.testrail.net)

**username**: _string_ email of a user under which the test run will be created

**password**: _string_ password or the API key for the aforementioned user

**projectId**: _number_ projet number with which the tests are associated

**suiteId**: _number_ suite number with which the tests are associated

**runName**: _number_ (optional) name of the Testrail run

## References

* https://github.com/awaragi/mocha-testrail-reporter
* http://mochajs.org/#mochaopts
* https://github.com/mochajs/mocha/wiki/Third-party-reporters
* http://docs.gurock.com/testrail-api2/start
