import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'e2e/cypress/**/*.cy.{ts,js}',
    supportFile: 'e2e/cypress/support/e2e.ts',
    fixturesFolder: 'e2e/cypress/fixtures',
    screenshotsFolder: 'test-results/cypress-screenshots',
    videosFolder: 'test-results/cypress-videos',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 30000,
    video: true,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
  },
});
