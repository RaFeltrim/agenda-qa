/**
 * Global teardown for Playwright tests
 * Ensures all resources are properly cleaned up after test execution
 */

export default async function globalTeardown() {
  console.log('🧹 Running global teardown...');
  
  // Perform any necessary cleanup here
  // For example, closing database connections, cleaning up temp files, etc.
  
  // Add a small delay to ensure all processes have time to finish
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('✅ Global teardown completed');
}