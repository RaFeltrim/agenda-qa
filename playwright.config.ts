import { defineConfig, devices } from '@playwright/test';
import os from 'os';

/**
 * Playwright E2E Test Configuration
 * Agenda-QA Project
 */
export default defineConfig({
  testDir: './e2e/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  
  // Control worker count to prevent CPU overload (CPU cores - 1)
  workers: process.env.CI ? 1 : Math.max(1, os.cpus().length - 1),
  
  reporter: [
    ['html', { open: 'never', outputFolder: 'test-results/playwright-report' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['list']
  ],
  outputDir: 'test-results/playwright-artifacts',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Ensure headless mode for CI environments
    ...(process.env.CI ? { headless: true } : {}),
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Use headless mode in CI
        ...(process.env.CI ? { headless: true } : {}),
      },
    },
  ],

  /* Start dev server before running tests (unless already running) */
  webServer: {
    command: 'npm run dev -- --port 5173',
    port: 5173,
    reuseExistingServer: true,
    timeout: 60000,
  },

  globalTeardown: require.resolve('./global-teardown'),
});
