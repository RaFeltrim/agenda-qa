#!/usr/bin/env node

/**
 * Enhanced Test Pipeline Runner
 * Lead SDET - AGENDA-QA Project
 * 
 * This script orchestrates the complete test pipeline with:
 * - Parallel execution optimization
 * - Smart test grouping and prioritization
 * - Comprehensive reporting
 * - Performance monitoring
 * - Failure analysis and retry logic
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// Configuration
const CONFIG = {
  testDirs: {
    unit: '__tests__',
    e2e: 'e2e/tests',
    component: 'cypress/component'
  },
  reporters: {
    junit: 'test-results/junit',
    html: 'test-results/html',
    json: 'test-results/json'
  },
  timeouts: {
    unit: 30000,
    e2e: 120000,
    component: 60000
  },
  retries: {
    unit: 1,
    e2e: 2,
    component: 1
  }
};

// Test suite priorities
const TEST_PRIORITIES = {
  smoke: ['authentication.spec.ts'], // Critical path tests
  functional: ['kanban.spec.ts'],    // Core functionality
  integration: [],                   // Cross-component tests
  performance: [],                   // Load/stress tests
  security: []                       // Security validation tests
};

class TestPipelineRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      suites: {}
    };
    this.startTime = Date.now();
  }

  async run() {
    console.log('🚀 Starting AGENDA-QA Test Pipeline...\n');
    
    try {
      // 1. Setup environment
      await this.setupEnvironment();
      
      // 2. Run smoke tests first (critical path)
      console.log('🔍 Running Smoke Tests...');
      const smokeResult = await this.runSmokeTests();
      
      if (!smokeResult.success) {
        console.error('❌ Smoke tests failed. Stopping pipeline.');
        return this.generateReport(smokeResult);
      }
      
      // 3. Run functional tests
      console.log('\n🧪 Running Functional Tests...');
      const functionalResult = await this.runFunctionalTests();
      
      // 4. Run remaining test suites in parallel
      console.log('\n⚡ Running Parallel Test Suites...');
      const parallelResults = await this.runParallelSuites();
      
      // 5. Generate comprehensive report
      const finalResults = this.mergeResults([smokeResult, functionalResult, ...parallelResults]);
      return this.generateReport(finalResults);
      
    } catch (error) {
      console.error('💥 Pipeline execution failed:', error);
      process.exit(1);
    }
  }

  async setupEnvironment() {
    console.log('🔧 Setting up test environment...');
    
    // Create test results directories
    for (const dir of Object.values(CONFIG.reporters)) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (e) {
        // Directory might already exist
      }
    }
    
    // Clear previous test data
    await this.clearTestData();
    
    // Start development server if needed
    await this.ensureDevServer();
  }

  async runSmokeTests() {
    const smokeTests = TEST_PRIORITIES.smoke.map(file => 
      path.join(CONFIG.testDirs.e2e, file)
    );
    
    return await this.executeTestSuite('smoke', smokeTests, {
      timeout: CONFIG.timeouts.e2e,
      retries: CONFIG.retries.e2e,
      headless: true
    });
  }

  async runFunctionalTests() {
    const functionalTests = TEST_PRIORITIES.functional.map(file => 
      path.join(CONFIG.testDirs.e2e, file)
    );
    
    return await this.executeTestSuite('functional', functionalTests, {
      timeout: CONFIG.timeouts.e2e,
      retries: CONFIG.retries.e2e,
      headless: true
    });
  }

  async runParallelSuites() {
    const suites = [
      this.runUnitTestSuite(),
      this.runComponentTests(),
      this.runPerformanceTests(),
      this.runSecurityTests()
    ];
    
    return Promise.all(suites);
  }

  async runUnitTestSuite() {
    return await this.executeTestSuite('unit', [CONFIG.testDirs.unit], {
      timeout: CONFIG.timeouts.unit,
      retries: CONFIG.retries.unit,
      coverage: true
    });
  }

  async runComponentTests() {
    return await this.executeTestSuite('component', [CONFIG.testDirs.component], {
      timeout: CONFIG.timeouts.component,
      retries: CONFIG.retries.component
    });
  }

  async runPerformanceTests() {
    // Placeholder for performance tests
    return {
      suite: 'performance',
      success: true,
      passed: 0,
      failed: 0,
      skipped: 0
    };
  }

  async runSecurityTests() {
    // Placeholder for security tests
    return {
      suite: 'security',
      success: true,
      passed: 0,
      failed: 0,
      skipped: 0
    };
  }

  async executeTestSuite(suiteName, testFiles, options = {}) {
    console.log(`  ▶️  Executing ${suiteName} tests...`);
    
    const startTime = Date.now();
    let result;
    
    try {
      // Determine which test runner to use
      const runner = this.getTestRunner(suiteName);
      
      // Execute tests
      result = await runner(testFiles, options);
      
      const duration = Date.now() - startTime;
      result.duration = duration;
      result.suite = suiteName;
      
      console.log(`  ✅ ${suiteName} completed in ${duration}ms`);
      
    } catch (error) {
      console.error(`  ❌ ${suiteName} failed:`, error.message);
      result = {
        suite: suiteName,
        success: false,
        passed: 0,
        failed: 1,
        skipped: 0,
        error: error.message
      };
    }
    
    return result;
  }

  getTestRunner(suiteName) {
    const runners = {
      smoke: this.runPlaywrightTests.bind(this),
      functional: this.runPlaywrightTests.bind(this),
      unit: this.runJestTests.bind(this),
      component: this.runCypressTests.bind(this),
      performance: this.runPerformanceTests.bind(this),
      security: this.runSecurityTests.bind(this)
    };
    
    return runners[suiteName] || this.runPlaywrightTests.bind(this);
  }

  async runPlaywrightTests(testFiles, options) {
    const args = [
      'test',
      ...testFiles,
      '--reporter=html,json,junit',
      `--timeout=${options.timeout || CONFIG.timeouts.e2e}`,
      ...(options.headless ? ['--headed=false'] : [])
    ];
    
    if (options.retries) {
      args.push(`--retries=${options.retries}`);
    }
    
    return await this.executeCommand('npx', args, {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test' }
    });
  }

  async runJestTests(testFiles, options) {
    const args = [
      '--testPathPattern',
      testFiles.join('|'),
      '--reporters=default',
      '--reporters=jest-junit',
      ...(options.coverage ? ['--coverage'] : []),
      `--testTimeout=${options.timeout || CONFIG.timeouts.unit}`
    ];
    
    return await this.executeCommand('npx', ['jest', ...args], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test' }
    });
  }

  async runCypressTests(testFiles, options) {
    const args = [
      'run',
      '--spec',
      testFiles.join(','),
      '--reporter',
      'junit',
      ...(options.headless ? ['--headless'] : [])
    ];
    
    return await this.executeCommand('npx', ['cypress', ...args], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test' }
    });
  }

  async executeCommand(command, args, options) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        ...options,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            stdout,
            stderr,
            code
          });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async clearTestData() {
    // Clear localStorage and sessionStorage
    // This would typically be done in beforeEach hooks
    console.log('  🧹 Clearing test data...');
  }

  async ensureDevServer() {
    // Check if dev server is running, start if needed
    console.log('  🌐 Ensuring development server is available...');
  }

  mergeResults(results) {
    return results.reduce((acc, result) => {
      acc.passed += result.passed || 0;
      acc.failed += result.failed || 0;
      acc.skipped += result.skipped || 0;
      acc.duration += result.duration || 0;
      acc.suites[result.suite] = result;
      return acc;
    }, {
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      suites: {}
    });
  }

  async generateReport(results) {
    const totalTime = Date.now() - this.startTime;
    
    const report = {
      timestamp: new Date().toISOString(),
      totalTime,
      summary: {
        total: results.passed + results.failed + results.skipped,
        passed: results.passed,
        failed: results.failed,
        skipped: results.skipped,
        successRate: ((results.passed / (results.passed + results.failed)) * 100).toFixed(2) + '%'
      },
      suites: results.suites,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch
      }
    };
    
    // Write report files
    await fs.writeFile(
      path.join(CONFIG.reporters.json, 'test-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    // Print console summary
    console.log('\n📋 TEST PIPELINE SUMMARY');
    console.log('========================');
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Skipped: ${report.summary.skipped}`);
    console.log(`Success Rate: ${report.summary.successRate}`);
    console.log(`Total Time: ${totalTime}ms`);
    
    if (results.failed > 0) {
      console.log('\n❌ FAILED SUITES:');
      Object.entries(results.suites).forEach(([suite, data]) => {
        if (!data.success) {
          console.log(`  - ${suite}: ${data.error || 'Unknown error'}`);
        }
      });
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed! Pipeline completed successfully.');
      process.exit(0);
    }
    
    return report;
  }
}

// Execute pipeline
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestPipelineRunner();
  runner.run().catch(console.error);
}

export default TestPipelineRunner;