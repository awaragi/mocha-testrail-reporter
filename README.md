# TestRail Reporter for Cypress

Publishes [Cypress](https://www.cypress.io/) runs on TestRail

## Install

```shell
$ npm i -D cypress-testrail-reporter
```

## Usage

Add reporter to the `cypress.json`:

```json
...
"reporter": "cypress-testrail-reporter",
"reporterOptions": {
  "domain": "yourdomain.testrail.com",
  "username": "username",
  "password": "password",
  "projectId": 1,
  "suiteId": 1,
}
```

Your Cypress tests should include ID of a TestRail test cases. Make sure your test case ids are distinct from the test titles:

```Javascript
it("C123 C124 Can authenticate with invalid user", . . .
it("Can authenticate a valid user C321", . . .
```

## Reporter Options

**domain**: _string_ domain name of your TestRail instance (e.g. for a hosted instance instance.testrail.net)

**username**: _string_ email of a user under which the test run will be created

**password**: _string_ password or the API key for the aforementioned user

**projectId**: _number_ projet with which the tests are associated

**suiteId**: _number_ suite with which the tests are associated

**runName**: _string_ (optional) name of the Testrail run

## TestRail Settings

To increase security, TestRail team suggests using an API key instead of the password. You can see how to generate an API key [here](http://docs.gurock.com/testrail-api2/accessing#username_and_api_key)

If you maintain your own TestRail instance on your own server, it is recommended to [enable HTTPS for your TestRail installation](http://docs.gurock.com/testrail-admin/admin-securing#using_https)

For TestRail Hosted accounts maintained by [Gurock](http://www.gurock.com/), all accounts will automatically use HTTPS.

You can read the whole TestRail documentation [here](http://docs.gurock.com/)

## Authors

* **Milutin Savovic** - *Initial setup* - [github](https://github.com/mickosav)

## License

This project is licensed under the MIT License

## Acknowledgments

* [Pierre Awaragi](https://github.com/awaragi) who owns the [mocha-testrail-reporter](https://github.com/awaragi/mocha-testrail-reporter) repository that was forked