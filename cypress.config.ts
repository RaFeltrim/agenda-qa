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
    
    // Optimized timeouts to prevent hanging
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 20000,
    
    chromeWebSecurity: false,
    
    // Disable video recording in CI to save resources
    video: !process.env.CI,
    screenshotOnRunFailure: true,
    
    // Optimize retries
    retries: {
      runMode: process.env.CI ? 1 : 2,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      // Ensure headless mode in CI
      if (process.env.CI) {
        config.video = false;
      }
      
      on('task', {
        log(message: string) {
          console.log(message);
          return null;
        },
      });
      
      return config;
    },
  },
});
