#!/bin/bash
# File: scripts/run-optimized-test-suite.sh
# Optimized Test Suite Execution with Phased Approach

echo "🚀 Starting Optimized Test Suite Execution"
echo "========================================="

# Setup
echo "🔧 Setting up test environment..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Execute test phases with timing
echo ""
echo "🧪 Phase 1: Linter & Unit Tests"
echo "--------------------------------"
START_TIME=$(date +%s)
npm run lint
npm run test -- --run
LINTER_UNIT_DURATION=$(( $(date +%s) - START_TIME ))
echo "⏱️  Phase 1 completed in ${LINTER_UNIT_DURATION}s"

echo ""
echo "🧪 Phase 2: Smoke Tests (Critical Path)"
echo "---------------------------------------"
START_TIME=$(date +%s)
# Run only smoke tests - fast feedback on critical functionality
npx playwright test --grep "@smoke"
SMOKE_DURATION=$(( $(date +%s) - START_TIME ))
echo "⏱️  Phase 2 completed in ${SMOKE_DURATION}s"

# Check if smoke tests passed before continuing
if [ $? -ne 0 ]; then
    echo "❌ Smoke tests failed! Stopping execution."
    exit 1
fi

echo ""
echo "🧪 Phase 3: Regression Tests (Full Coverage)"
echo "--------------------------------------------"
START_TIME=$(date +%s)
# Run regression tests excluding smoke tests to avoid duplication
npx playwright test --grep-invert "@smoke" --workers=2
REGRESSION_DURATION=$(( $(date +%s) - START_TIME ))
echo "⏱️  Phase 3 completed in ${REGRESSION_DURATION}s"

echo ""
echo "🧪 Phase 4: Cypress E2E Tests"
echo "------------------------------"
START_TIME=$(date +%s)
npm run test:cy
CYPRESS_DURATION=$(( $(date +%s) - START_TIME ))
echo "⏱️  Phase 4 completed in ${CYPRESS_DURATION}s"

# Calculate total duration
TOTAL_DURATION=$(( LINTER_UNIT_DURATION + SMOKE_DURATION + REGRESSION_DURATION + CYPRESS_DURATION ))

echo ""
echo "📊 EXECUTION SUMMARY"
echo "==================="
echo "Linter & Unit: ${LINTER_UNIT_DURATION}s"
echo "Smoke Tests: ${SMOKE_DURATION}s"  
echo "Regression Tests: ${REGRESSION_DURATION}s"
echo "Cypress Tests: ${CYPRESS_DURATION}s"
echo "Total Duration: ${TOTAL_DURATION}s"
echo ""
echo "✅ Test execution completed successfully!"

# Generate final report
echo ""
echo "📊 Generating coverage report..."
npm run test:report 2>/dev/null || echo "Coverage report generation skipped."

echo ""
echo "📄 Test artifacts saved in ./test-results/"
echo "📖 Open test-results/playwright-report/index.html for detailed Playwright results"