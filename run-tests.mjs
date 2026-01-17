#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Running Comprehensive Test Suite for Agenda Kanban v3.0\n');

const testCommands = [
  {
    name: 'Unit Tests - Core Components',
    command: 'npx jest --config=jest.config.mjs components/__tests__/* --verbose',
  },
  {
    name: 'Unit Tests - Hooks',
    command: 'npx jest --config=jest.config.mjs hooks/__tests__/* --verbose',
  },
  {
    name: 'Unit Tests - Services',
    command: 'npx jest --config=jest.config.mjs services/__tests__/* --verbose',
  },
  {
    name: 'Integration Tests',
    command: 'npx jest --config=jest.config.mjs components/__tests__/*.integration.* --verbose',
  },
  {
    name: 'Coverage Report',
    command: 'npx jest --config=jest.config.mjs --coverage --colors',
  },
];

async function runTestSuite() {
  let passedSuites = 0;
  let totalSuites = testCommands.length;

  for (const [index, test] of testCommands.entries()) {
    console.log(`\n🧪 [${index + 1}/${totalSuites}] ${test.name}`);
    console.log('─'.repeat(50));

    try {
      await new Promise((resolve, reject) => {
        const child = spawn(test.command, {
          shell: true,
          stdio: 'inherit',
          cwd: __dirname,
        });

        child.on('close', code => {
          if (code === 0) {
            console.log(`✅ ${test.name} - PASSED`);
            passedSuites++;
            resolve(code);
          } else {
            console.log(`❌ ${test.name} - FAILED`);
            reject(new Error(`Test suite failed with code ${code}`));
          }
        });

        child.on('error', error => {
          console.log(`💥 ${test.name} - ERROR: ${error.message}`);
          reject(error);
        });
      });
    } catch (error) {
      console.log(`⚠️  Continuing with remaining test suites...\n`);
    }
  }

  console.log('\n📊 Test Execution Summary');
  console.log('═'.repeat(50));
  console.log(`✅ Passed: ${passedSuites}/${totalSuites} test suites`);
  console.log(`🎯 Success Rate: ${Math.round((passedSuites / totalSuites) * 100)}%`);

  if (passedSuites === totalSuites) {
    console.log('\n🎉 All test suites completed successfully!');
    console.log('🏆 The Agenda Kanban system is thoroughly tested and reliable.');
  } else {
    console.log('\n⚠️  Some test suites failed. Please review the output above.');
  }

  process.exit(passedSuites === totalSuites ? 0 : 1);
}

runTestSuite().catch(error => {
  console.error('Fatal error running test suite:', error);
  process.exit(1);
});
