let Reporter = require("../../index.js");
import { Runner, Test } from "./helpers/mock-runner";
const assert = require("assert");

describe("Reporter", () => {
  let runner;

  function executeTestRunner(options) {
    options = options || {};
    options.invalidChar = options.invalidChar || "";
    options.title = options.title || "Foo Bar module";
    options.root = typeof options.root !== "undefined" ? options.root : false;
    runner.start();

    runner.startSuite({
      title: options.title,
      root: options.root,
      tests: [1, 2]
    });

    if (!options.skipPassedTests) {
      runner.pass(new Test("Foo can weez the juice", "can weez the juice", 1));
    }

    runner.fail(
      new Test("Bar can narfle the garthog", "can narfle the garthog", 1),
      {
        stack:
          options.invalidChar +
          "expected garthog to be dead" +
          options.invalidChar
      }
    );

    runner.fail(
      new Test("Baz can behave like a flandip", "can behave like a flandip", 1),
      {
        name: "BazError",
        message:
          "expected baz to be masher, a hustler, an uninvited grasper of cone"
      }
    );

    runner.startSuite({
      title: "Another suite!",
      tests: [1]
    });

    runner.pass(new Test("Another suite", "works", 4));

    if (options && options.includePending) {
      runner.startSuite({
        title: "Pending suite!",
        tests: [1]
      });
      runner.pending(new Test("Pending suite", "pending"));
    }

    runner.end();
  }

  function createReporter(options) {
    options = options || {};
    return new Reporter(runner, { reporterOptions: options });
  }

  beforeEach(function() {
    runner = new Runner();
  });

  it("Requires either suiteID or runId", () => {
    let testFunc = function() {
      createReporter({
        domain: process.env.DOMAIN,
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
        projectId: process.env.PROJECT_ID
      });
      executeTestRunner({});
    };

    assert.throws(
      testFunc,
      /Error: Missing either options of: suiteId, runId. Please update --reporter-options in mocha.opts/
    );
  });

  it("Requires projectId", () => {
    let testFunc = function() {
      createReporter({
        domain: process.env.DOMAIN,
        username: process.env.USERNAME,
        password: process.env.PASSWORD
      });
      executeTestRunner({});
    };

    assert.throws(
      testFunc,
      /Missing projectId value. Please update --reporter-options in mocha.opts/
    );
  });
});
