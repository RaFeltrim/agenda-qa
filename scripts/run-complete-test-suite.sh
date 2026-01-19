#!/bin/bash
# File: scripts/run-complete-test-suite.sh

echo "🚀 Starting Complete Test Suite Execution"
echo "========================================"

# Setup
echo "🔧 Setting up test environment..."
npm run build
npm run test:setup

# Execute test phases
echo "🧪 Phase 1: Unit Tests"
npm run test:unit -- --coverage

echo "🧪 Phase 2: Integration Tests"
npm run test:integration

echo "🧪 Phase 3: E2E Tests"
npm run test:e2e

echo "🧪 Phase 4: Security Tests"
npm run test:security

echo "🧪 Phase 5: Performance Tests"
npm run test:performance

echo "🧪 Phase 6: Accessibility Tests"
npm run test:a11y

# Generate final report
echo "📊 Generating coverage report..."
npm run test:report

echo "✅ Test execution completed!"
echo "📄 Open coverage/index.html for detailed results"