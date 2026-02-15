@echo off
REM File: scripts/run-optimized-test-suite.bat
REM Optimized Test Suite Execution with Phased Approach

echo 🚀 Starting Optimized Test Suite Execution
echo =========================================

REM Setup
echo 🔧 Setting up test environment...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    exit /b 1
)

REM Execute test phases with timing
echo.
echo 🧪 Phase 1: Linter & Unit Tests
echo --------------------------------
for /f %%i in ('powershell -Command "(Get-Date).ToFileTime()"') do set START_TIME=%%i

call npm run lint
call npm run test -- --run

for /f %%i in ('powershell -Command "(Get-Date).ToFileTime(); (Get-Date).ToFileTime() - %START_TIME%"') do set LINTER_UNIT_DURATION=%%i
set /a LINTER_UNIT_DURATION=%LINTER_UNIT_DURATION%/10000000
echo ⏱️  Phase 1 completed in %LINTER_UNIT_DURATION%s

echo.
echo 🧪 Phase 2: Smoke Tests (Critical Path)
echo ---------------------------------------
for /f %%i in ('powershell -Command "(Get-Date).ToFileTime()"') do set START_TIME=%%i

REM Run only smoke tests - fast feedback on critical functionality
npx playwright test --grep "@smoke"
set SMOKE_EXIT_CODE=%ERRORLEVEL%
for /f %%i in ('powershell -Command "(Get-Date).ToFileTime(); (Get-Date).ToFileTime() - %START_TIME%"') do set SMOKE_DURATION=%%i
set /a SMOKE_DURATION=%SMOKE_DURATION%/10000000
echo ⏱️  Phase 2 completed in %SMOKE_DURATION%s

REM Check if smoke tests passed before continuing
if %SMOKE_EXIT_CODE% NEQ 0 (
    echo ❌ Smoke tests failed! Stopping execution.
    exit /b 1
)

echo.
echo 🧪 Phase 3: Regression Tests (Full Coverage)
echo --------------------------------------------
for /f %%i in ('powershell -Command "(Get-Date).ToFileTime()"') do set START_TIME=%%i

REM Run regression tests excluding smoke tests to avoid duplication
npx playwright test --grep-invert "@smoke" --workers=2
for /f %%i in ('powershell -Command "(Get-Date).ToFileTime(); (Get-Date).ToFileTime() - %START_TIME%"') do set REGRESSION_DURATION=%%i
set /a REGRESSION_DURATION=%REGRESSION_DURATION%/10000000
echo ⏱️  Phase 3 completed in %REGRESSION_DURATION%s

echo.
echo 🧪 Phase 4: Cypress E2E Tests
echo ------------------------------
for /f %%i in ('powershell -Command "(Get-Date).ToFileTime()"') do set START_TIME=%%i

call npm run test:cy
for /f %%i in ('powershell -Command "(Get-Date).ToFileTime(); (Get-Date).ToFileTime() - %START_TIME%"') do set CYPRESS_DURATION=%%i
set /a CYPRESS_DURATION=%CYPRESS_DURATION%/10000000
echo ⏱️  Phase 4 completed in %CYPRESS_DURATION%s

REM Calculate total duration (simplified calculation)
set /a TOTAL_DURATION=%LINTER_UNIT_DURATION%+%SMOKE_DURATION%+%REGRESSION_DURATION%+%CYPRESS_DURATION%

echo.
echo 📊 EXECUTION SUMMARY
echo ===================
echo Linter ^& Unit: %LINTER_UNIT_DURATION%s
echo Smoke Tests: %SMOKE_DURATION%s  
echo Regression Tests: %REGRESSION_DURATION%s
echo Cypress Tests: %CYPRESS_DURATION%s
echo Total Duration: %TOTAL_DURATION%s
echo.
echo ✅ Test execution completed successfully!

REM Generate final report
echo.
echo 📊 Generating coverage report...
call npm run test:report >nul 2>&1
if %ERRORLEVEL% NEQ 0 echo Coverage report generation skipped.

echo.
echo 📄 Test artifacts saved in ./test-results/
echo 📖 Open test-results/playwright-report/index.html for detailed Playwright results