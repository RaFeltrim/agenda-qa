import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Agenda-QA Project
 */
export default defineConfig({
  testDir: './e2e/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
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
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Start dev server before running tests (unless already running) */
  webServer: {
    command: 'npm run dev -- --port 5173',
    port: 5173,
    reuseExistingServer: true,
    timeout: 60000,
  },
});
