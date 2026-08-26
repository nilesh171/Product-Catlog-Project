/**
 * @file test-framework.js
 * @description Lightweight Zero-Dependency Test Runner and Assertion Framework
 */

class Assertion {
  constructor(actual, isNegated = false) {
    this.actual = actual;
    this.isNegated = isNegated;
  }

  get not() {
    return new Assertion(this.actual, !this.isNegated);
  }

  _test(passed, message, expected) {
    const condition = this.isNegated ? !passed : passed;
    if (!condition) {
      const verb = this.isNegated ? 'expected NOT to' : 'expected to';
      const errMsg = message || `Assertion failed: ${verb} match ${JSON.stringify(expected)}, received ${JSON.stringify(this.actual)}`;
      throw new Error(errMsg);
    }
  }

  toBe(expected) {
    this._test(
      Object.is(this.actual, expected),
      `Expected ${JSON.stringify(this.actual)} ${this.isNegated ? 'NOT to be' : 'to be'} ${JSON.stringify(expected)}`,
      expected
    );
  }

  toEqual(expected) {
    const passed = deepEqual(this.actual, expected);
    this._test(
      passed,
      `Expected ${JSON.stringify(this.actual)} ${this.isNegated ? 'NOT to equal' : 'to equal'} ${JSON.stringify(expected)}`,
      expected
    );
  }

  toBeGreaterThan(expected) {
    this._test(
      this.actual > expected,
      `Expected ${this.actual} ${this.isNegated ? 'NOT to be greater than' : 'to be greater than'} ${expected}`,
      expected
    );
  }

  toBeGreaterThanOrEqual(expected) {
    this._test(
      this.actual >= expected,
      `Expected ${this.actual} ${this.isNegated ? 'NOT to be >=' : 'to be >='} ${expected}`,
      expected
    );
  }

  toBeLessThan(expected) {
    this._test(
      this.actual < expected,
      `Expected ${this.actual} ${this.isNegated ? 'NOT to be less than' : 'to be less than'} ${expected}`,
      expected
    );
  }

  toBeLessThanOrEqual(expected) {
    this._test(
      this.actual <= expected,
      `Expected ${this.actual} ${this.isNegated ? 'NOT to be <=' : 'to be <='} ${expected}`,
      expected
    );
  }

  toBeTruthy() {
    this._test(
      Boolean(this.actual),
      `Expected ${JSON.stringify(this.actual)} ${this.isNegated ? 'NOT to be truthy' : 'to be truthy'}`
    );
  }

  toBeFalsy() {
    this._test(
      !this.actual,
      `Expected ${JSON.stringify(this.actual)} ${this.isNegated ? 'NOT to be falsy' : 'to be falsy'}`
    );
  }

  toBeNull() {
    this._test(
      this.actual === null,
      `Expected ${JSON.stringify(this.actual)} ${this.isNegated ? 'NOT to be null' : 'to be null'}`
    );
  }

  toContain(item) {
    let passed = false;
    if (typeof this.actual === 'string') {
      passed = this.actual.includes(item);
    } else if (Array.isArray(this.actual)) {
      passed = this.actual.includes(item);
    } else if (this.actual instanceof Set) {
      passed = this.actual.has(item);
    }
    this._test(
      passed,
      `Expected collection ${this.isNegated ? 'NOT to contain' : 'to contain'} ${JSON.stringify(item)}`
    );
  }

  toHaveLength(expectedLength) {
    const actualLength = this.actual ? this.actual.length : undefined;
    this._test(
      actualLength === expectedLength,
      `Expected length to be ${expectedLength}, got ${actualLength}`,
      expectedLength
    );
  }

  toThrow(expectedMessage) {
    if (typeof this.actual !== 'function') {
      throw new Error('toThrow requires a function');
    }
    let threw = false;
    let thrownError = null;
    try {
      this.actual();
    } catch (err) {
      threw = true;
      thrownError = err;
    }

    if (!this.isNegated) {
      if (!threw) {
        throw new Error('Expected function to throw an error, but it did not.');
      }
      if (expectedMessage) {
        const messageMatch =
          expectedMessage instanceof RegExp
            ? expectedMessage.test(thrownError.message)
            : thrownError.message.includes(expectedMessage);
        if (!messageMatch) {
          throw new Error(`Expected error message to match "${expectedMessage}", got "${thrownError.message}"`);
        }
      }
    } else {
      if (threw) {
        throw new Error(`Expected function NOT to throw, but it threw: ${thrownError.message}`);
      }
    }
  }
}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (a === null || typeof a !== 'object' || b === null || typeof b !== 'object') {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

export function expect(actual) {
  return new Assertion(actual);
}

class TestSuiteRunner {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
      beforeEach: [...this.beforeEachHooks],
      afterEach: [...this.afterEachHooks],
    };
    this.suites.push(suite);
    const parentSuite = this.currentSuite;
    this.currentSuite = suite;
    fn();
    this.currentSuite = parentSuite;
  }

  it(name, fn) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => this.it(name, fn));
      return;
    }
    this.currentSuite.tests.push({ name, fn });
  }

  beforeEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeEach.push(fn);
    } else {
      this.beforeEachHooks.push(fn);
    }
  }

  afterEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterEach.push(fn);
    } else {
      this.afterEachHooks.push(fn);
    }
  }

  async run() {
    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      suites: [],
      startTime: Date.now(),
      duration: 0,
    };

    for (const suite of this.suites) {
      const suiteResult = {
        name: suite.name,
        tests: [],
        passed: true,
      };

      for (const test of suite.tests) {
        results.total++;
        const testResult = {
          name: test.name,
          passed: true,
          error: null,
          duration: 0,
        };

        const testStart = Date.now();
        try {
          for (const hook of suite.beforeEach) {
            await hook();
          }

          await test.fn();

          for (const hook of suite.afterEach) {
            await hook();
          }
          results.passed++;
        } catch (err) {
          testResult.passed = false;
          testResult.error = err;
          suiteResult.passed = false;
          results.failed++;
        }
        testResult.duration = Date.now() - testStart;
        suiteResult.tests.push(testResult);
      }

      results.suites.push(suiteResult);
    }

    results.duration = Date.now() - results.startTime;
    return results;
  }
}

export const runner = new TestSuiteRunner();
export const describe = runner.describe.bind(runner);
export const it = runner.it.bind(runner);
export const beforeEach = runner.beforeEach.bind(runner);
export const afterEach = runner.afterEach.bind(runner);
