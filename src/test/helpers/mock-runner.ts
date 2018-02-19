/**
 * Adapted from: https://github.com/michaelleeallen/mocha-junit-reporter/blob/master/test/helpers/mock-runner.js
 */
'use strict';

import {EventEmitter} from 'events';
const util = require('util');

export class Runner extends EventEmitter {
  _currentSuite: any;
    constructor() {
        super()
    }

    public start() {
      this.emit('start');
    }

    public end() {
      this.emit('end');
    };

    public startSuite(suite: any) {
      suite.suites = suite.suites || [];
      suite.tests = suite.tests || [];

      if (this._currentSuite) {
        suite.parent = this._currentSuite;
      }

      this._currentSuite = suite;
      this.emit('suite', suite);
    }

    public pass(test) {
      this.emit('pass', test);
      this.endTest();
    };

    public fail(test, reason) {
      this.emit('fail', test, reason);
      this.endTest();
    };

    public pending(test) {
      this.emit('pending', test);
      this.endTest();
    };

    public endTest() {
      this.emit('end test');
    };
}

export class Test {
  private title;
  private duration;
  private fullTitle;
  private slow;
  constructor(fullTitle, title, duration?) {
    this.title = title;
    this.duration = duration;
    this.fullTitle = function() {
      return fullTitle;
    };
    this.slow = function() {};
  }
}