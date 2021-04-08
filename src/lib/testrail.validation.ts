import { TestRailOptions } from "./testrail.interface";
const glob = require('glob');
const TestRailLogger = require('./testrail.logger');

export class TestRailValidation {

  constructor(private options: TestRailOptions) {
  }

  public validateReporterOptions (reporterOptions) {
    if (!reporterOptions) {
      throw new Error('Missing reporterOptions in cypress.json');
    }
    this.validate(reporterOptions, 'host');
    this.validate(reporterOptions, 'username');
    this.validate(reporterOptions, 'password');
    this.validate(reporterOptions, 'projectId');
    if (this.options.suiteId) {
      this.validate(reporterOptions, 'suiteId');
    }
    return reporterOptions;
  }
    
  private validate (options, name) {
    if (options[name] == null) {
      throw new Error(`Missing ${name} value. Please update options in cypress.json`);
    }
  }
    
  /**
   * This function will validate do we pass suiteId as a CLI agrument as a part of command line execution 
   * Example: 
   * CYPRESS_ENV="testRailSuiteId=1"
   * npx cypress run --env="${CYPRESS_ENV}"
   */
  public validateCLIArguments () {
    // Read and store cli arguments into array
    const cliArgs = process.argv.slice(2);
    // Search array for a specific string and store into variable
    var index, value, result;
    for (index = 0; index < cliArgs.length; ++index) {
      value = cliArgs[index];
      if (value.includes('testRailSuiteId') === true) {
        result = value;
        break;
      }
    }
    if (result != undefined) {
      /**
       * Search for specific variable in case that previous command contains multiple results
       * Split variables
       */
      const resultArrayArgs = result.split(/,/);
      for (index = 0; index < resultArrayArgs.length; ++index) {
        value = resultArrayArgs[index];
        if (value.includes('testRailSuiteId') === true) {
          result = value;
          break;
        }
      }
      // Split variable and value
      const resultArray = result.split(/=/);
      // Find value of suiteId and store it in envVariable
      const suiteId = resultArray.find(el => el.length < 15)
      if (suiteId.length != 0) {
        TestRailLogger.log(`Following suiteId has been set in runtime environment variables: ${suiteId}`);
      }
      
      return suiteId;
    }
  }
    
  /**
   * This function will count how many test spec files do we have during execution
   * and based on that we will wait until last one is executed to close active test run in TestRail
   */
  public countTestSpecFiles () {
    // Read and store cli arguments into array
    var cliArgs = process.argv.slice(2);
    /**
     * Count how many test files will be included in the run
     * to be able to close test run after last one
     */
    var index, value, result, directory;
    var workingDirectory = [];
    var specFiles = [];
    var specFilesArray = [];
    for (index = 0; index < cliArgs.length; ++index) {
      value = cliArgs[index];
      if (
        value.includes("cypress/integration") === true ||
        value.includes("cypress/tests") === true
      ) {
        result = value;
        break;
      }
    }

    const specArg = result.split(/,/);
    for (index = 0; index < specArg.length; ++index) {
      value = specArg[index];
      result = value.replace(/(?:\.(?![^.]+$)|[^\w])+/g, "/");
      directory = result.replace(/\b(js|ts|feature)\b/, '');
      workingDirectory.push(directory);
    }
        
    for (index = 0; index < workingDirectory.length; ++index) {
      value = workingDirectory[index];
      const options = {
        cwd: value,
        nodir: true
      }
      result = glob.sync("*", options);
      specFiles.push(result);
    }
    
    /**
     * Since in previous steps we create 2D array, 
     * we need to covert it to 1D in order to get desired length
     */
    for (index = 0; index < specFiles.length; ++index) {
      specFilesArray = specFilesArray.concat(specFiles[index]);
    }
    
    return specFilesArray;
  }
}