import { test, expect } from '@playwright/test';
import { TEST_USERS, SELECTORS, ROUTES } from './fixtures';

/**
 * Debug test to analyze exact DOM structure of the login form
 */
test('DEBUG: inspect login form DOM', async ({ page }) => {
  await page.goto(ROUTES.login);
  await page.waitForLoadState('networkidle');

  // Wait for form to render
  await page.waitForTimeout(3000);

  // Log all inputs found on the page
  const allInputs = await page.locator('input').all();
  console.log(`Found ${allInputs.length} input elements`);
  for (let i = 0; i < allInputs.length; i++) {
    const inp = allInputs[i];
    const type = await inp.getAttribute('type');
    const placeholder = await inp.getAttribute('placeholder');
    const testId = await inp.getAttribute('data-testid');
    const id = await inp.getAttribute('id');
    const name = await inp.getAttribute('name');
    console.log(`  Input[${i}]: type=${type}, placeholder=${placeholder}, data-testid=${testId}, id=${id}, name=${name}`);
  }

  // Check if our selectors match
  const emailWrapperCount = await page.locator('[data-testid="login-email-input"]').count();
  const passwordWrapperCount = await page.locator('[data-testid="login-password-input"]').count();
  const submitCount = await page.locator('[data-testid="login-submit-button"]').count();

  console.log(`\nSelector matches:`);
  console.log(`  [data-testid="login-email-input"]: ${emailWrapperCount} matches`);
  console.log(`  [data-testid="login-password-input"]: ${passwordWrapperCount} matches`);
  console.log(`  [data-testid="login-submit-button"]: ${submitCount} matches`);

  // Check if data-testid is on wrapper or input
  if (emailWrapperCount > 0) {
    const wrapper = page.locator('[data-testid="login-email-input"]').first();
    const tagName = await wrapper.evaluate(el => el.tagName);
    console.log(`  Email wrapper tag: ${tagName}`);
    const innerInput = wrapper.locator('input');
    const innerCount = await innerInput.count();
    console.log(`  Inner inputs: ${innerCount}`);
  }

  // Try direct input approach using placeholder
  const emailByPlaceholder = page.locator('input[placeholder="Email institucional"]');
  console.log(`\n  input[placeholder="Email institucional"]: ${await emailByPlaceholder.count()} matches`);
  const passwordByPlaceholder = page.locator('input[placeholder="Sua senha"]');
  console.log(`  input[placeholder="Sua senha"]: ${await passwordByPlaceholder.count()} matches`);

  // Try filling with placeholder selectors
  await emailByPlaceholder.fill(TEST_USERS.editor.email);
  await passwordByPlaceholder.fill(TEST_USERS.editor.password);

  // Take screenshot before clicking login
  await page.screenshot({ path: 'test-results/debug-before-login.png' });

  // Click submit
  await page.locator('[data-testid="login-submit-button"]').first().click();

  // Wait a bit and check URL
  await page.waitForTimeout(10000);
  const finalUrl = page.url();
  console.log(`\nFinal URL after login attempt: ${finalUrl}`);
  await page.screenshot({ path: 'test-results/debug-after-login.png' });

  // Check for error messages
  const pageText = await page.locator('body').textContent();
  if (pageText?.includes('Invalid') || pageText?.includes('Erro') || pageText?.includes('inválid')) {
    console.log('ERROR MESSAGE FOUND on page');
  }
});
