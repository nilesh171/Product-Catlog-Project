/**
 * @file run-all-tests.js
 * @description Node.js CLI Test Runner
 */

import { runner } from './test-framework.js';
import { runFilterTests } from './unit/filterService.test.js';
import { runSortTests } from './unit/sortService.test.js';
import { runPaginationTests } from './unit/paginationService.test.js';
import { runValidationTests } from './unit/validationService.test.js';
import { runStateSyncTests } from './integration/stateSync.test.js';
import { runCatalogFlowTests } from './integration/catalogFlow.test.js';
import { runEdgeCaseTests } from './adversarial/edgeCases.test.js';

// Register all test suites
runFilterTests();
runSortTests();
runPaginationTests();
runValidationTests();
runStateSyncTests();
runCatalogFlowTests();
runEdgeCaseTests();

async function main() {
  console.log('====================================================');
  console.log('  PRODUCT CATALOG TEST SUITE — RUNNING TESTS');
  console.log('====================================================\n');

  const results = await runner.run();

  for (const suite of results.suites) {
    const icon = suite.passed ? '✓' : '✗';
    console.log(`${icon} [SUITE] ${suite.name}`);

    for (const test of suite.tests) {
      if (test.passed) {
        console.log(`    ✓ ${test.name} (${test.duration}ms)`);
      } else {
        console.log(`    ✗ ${test.name} (${test.duration}ms)`);
        console.log(`      Error: ${test.error.message}`);
        if (test.error.stack) {
          console.log(`      Stack: ${test.error.stack.split('\n').slice(1, 4).join('\n')}`);
        }
      }
    }
    console.log('');
  }

  console.log('====================================================');
  console.log(`Total Tests:    ${results.total}`);
  console.log(`Passed:         ${results.passed}`);
  console.log(`Failed:         ${results.failed}`);
  console.log(`Execution Time: ${results.duration}ms`);
  console.log('====================================================');

  if (results.failed > 0) {
    console.error('\n❌ Test Suite FAILED!\n');
    process.exit(1);
  } else {
    console.log('\n✨ ALL TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test runner execution error:', err);
  process.exit(1);
});
