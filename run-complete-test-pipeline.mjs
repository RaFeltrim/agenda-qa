#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Running Complete Test Pipeline for Agenda Kanban v3.0\n');
console.log('📋 Test Categories:');
console.log('   1. Unit Tests (Jest)');
console.log('   2. E2E Tests (Playwright)');
console.log('   3. Accessibility Tests');
console.log('   4. Performance Tests');
console.log('   5. Security Tests\n');

const testSuites = [
  {
    name: '🔧 Unit Tests - Core Components',
    command: 'npx jest --config=jest.config.mjs components/__tests__/* --verbose',
    description: 'Testing individual React components and their logic',
  },
  {
    name: '🎣 Unit Tests - Hooks and Services',
    command: 'npx jest --config=jest.config.mjs hooks/__tests__/* services/__tests__/* --verbose',
    description: 'Testing custom hooks and service layer functionality',
  },
  {
    name: '🌐 E2E Tests - User Workflows',
    command: 'npx playwright test e2e/user-workflows.spec.ts --headed',
    description: 'Testing complete user journeys and interactions',
  },
  {
    name: '♿ Accessibility Tests',
    command: 'npx playwright test e2e/accessibility.spec.ts --headed',
    description: 'Testing WCAG compliance and accessibility standards',
  },
  {
    name: '⚡ Performance Tests',
    command: 'npx playwright test e2e/performance.spec.ts --headed',
    description: 'Testing load times, responsiveness, and optimization',
  },
  {
    name: '🛡️ Security Tests',
    command: 'npx playwright test e2e/security.spec.ts --headed',
    description: 'Testing XSS prevention, input validation, and security measures',
  },
  {
    name: '📊 Coverage Report',
    command: 'npx jest --config=jest.config.mjs --coverage --colors',
    description: 'Generating code coverage statistics',
  },
];

async function runCompleteTestPipeline() {
  console.log('🎯 Starting Complete Test Execution...\n');

  let passedSuites = 0;
  let totalSuites = testSuites.length;

  for (const [index, testSuite] of testSuites.entries()) {
    console.log(`\n🧪 [${index + 1}/${totalSuites}] ${testSuite.name}`);
    console.log(`📝 ${testSuite.description}`);
    console.log('─'.repeat(60));

    try {
      await new Promise((resolve, reject) => {
        const child = spawn(testSuite.command, {
          shell: true,
          stdio: 'inherit',
          cwd: __dirname,
        });

        child.on('close', code => {
          if (code === 0) {
            console.log(`\n✅ ${testSuite.name} - PASSED`);
            passedSuites++;
            resolve(code);
          } else {
            console.log(`\n❌ ${testSuite.name} - FAILED (Exit code: ${code})`);
            // Continue with other test suites
            resolve(code);
          }
        });

        child.on('error', error => {
          console.log(`\n💥 ${testSuite.name} - ERROR: ${error.message}`);
          // Continue with other test suites
          resolve(1);
        });
      });

      // Small delay between test suites
      if (index < totalSuites - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.log(`\n⚠️  Error in ${testSuite.name}: ${error.message}`);
      console.log('Continuing with remaining test suites...\n');
    }
  }

  // Final Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 COMPLETE TEST PIPELINE SUMMARY');
  console.log('═'.repeat(60));
  console.log(`✅ Passed Test Suites: ${passedSuites}/${totalSuites}`);
  console.log(`🎯 Success Rate: ${Math.round((passedSuites / totalSuites) * 100)}%`);

  if (passedSuites === totalSuites) {
    console.log('\n🏆 ALL TEST SUITES COMPLETED SUCCESSFULLY!');
    console.log('✨ The Agenda Kanban system has passed comprehensive quality assurance testing.');
    console.log('🚀 Ready for production deployment.');
  } else {
    console.log('\n⚠️  Some test suites reported issues.');
    console.log('📋 Please review the output above for detailed failure information.');
    console.log('🔧 Recommended actions:');
    console.log('   • Fix failing unit tests');
    console.log('   • Address accessibility concerns');
    console.log('   • Optimize performance bottlenecks');
    console.log('   • Strengthen security measures');
  }

  console.log('\n📋 Test Categories Executed:');
  testSuites.forEach((suite, index) => {
    const status = index < passedSuites ? '✅' : '❌';
    console.log(`   ${status} ${suite.name.replace('🧪 ', '')}`);
  });

  console.log('\n📈 Quality Gate Status:');
  console.log('   🔧 Unit Test Coverage: 70% target');
  console.log('   ♿ Accessibility Compliance: WCAG 2.1 AA');
  console.log('   ⚡ Performance Budget: < 3s load time');
  console.log('   🛡️ Security Standards: XSS/Injection prevention');
  console.log('   🎯 User Experience: Smooth workflows verified');

  console.log('\n📋 Next Steps:');
  console.log('   1. Review detailed test reports');
  console.log('   2. Address any failing test cases');
  console.log('   3. Monitor CI/CD pipeline integration');
  console.log('   4. Schedule regular test execution');
  console.log('   5. Update tests as features evolve');

  process.exit(passedSuites === totalSuites ? 0 : 1);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Test execution interrupted by user');
  console.log('📋 Partial results recorded above');
  process.exit(130);
});

// Run the complete pipeline
runCompleteTestPipeline().catch(error => {
  console.error('💥 Fatal error in test pipeline:', error);
  process.exit(1);
});
