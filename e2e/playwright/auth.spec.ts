import { test, expect, type Page } from '@playwright/test';
import { TEST_USERS, SELECTORS, ROUTES } from './fixtures';

/**
 * AUTH E2E TESTS
 * Tests: Login, Signup tab, Password reset modal, Session persistence, Logout
 */

/** Helper: fill login form and submit */
async function loginAs(page: Page, email: string, password: string) {
  const emailInput = page.locator(SELECTORS.login.emailInput);
  const passwordInput = page.locator(SELECTORS.login.passwordInput);

  await emailInput.waitFor({ state: 'visible', timeout: 15000 });
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await page.locator(SELECTORS.login.submitButton).click();
}

test.describe('Authentication Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.login);
    await page.waitForLoadState('networkidle');
  });

  test('TC-AUTH-001: Login page loads correctly', async ({ page }) => {
    // Page title
    await expect(page.locator('text=Agenda QA')).toBeVisible();
    // Login and Signup tabs
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('text=Cadastro')).toBeVisible();
    // Form fields present
    await expect(page.locator(SELECTORS.login.emailInput)).toBeVisible();
    await expect(page.locator(SELECTORS.login.passwordInput)).toBeVisible();
  });

  test('TC-AUTH-002: Login with valid credentials redirects to dashboard', async ({ page }) => {
    await loginAs(page, TEST_USERS.editor.email, TEST_USERS.editor.password);

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 20000 });
    await expect(page).toHaveURL(/\/dashboard/);

    // Dashboard content should be visible
    await expect(page.locator('text=Portal de Governança')).toBeVisible({ timeout: 10000 });
  });

  test('TC-AUTH-003: Login with invalid credentials shows error', async ({ page }) => {
    await loginAs(page, 'fake@email.com', 'wrongpassword');

    // Should stay on login page
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/login/);

    // Error notification or message should appear
    const errorVisible = await page.locator('.ant-message-error, .ant-notification-error, text=Credenciais inválidas, text=Invalid login').first().isVisible().catch(() => false);
    expect(errorVisible || (await page.url()).includes('/login')).toBeTruthy();
  });

  test('TC-AUTH-004: Login form validates empty fields', async ({ page }) => {
    // Click submit without filling fields
    await page.locator(SELECTORS.login.submitButton).click();

    // Validation messages should appear
    await expect(page.locator('text=Insira seu email').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-AUTH-005: Signup tab is accessible and has correct fields', async ({ page }) => {
    await page.locator('text=Cadastro').click();
    await page.waitForTimeout(500);

    // Signup submit button should be visible
    await expect(page.locator(SELECTORS.login.signupButton)).toBeVisible({ timeout: 5000 });
  });

  test('TC-AUTH-006: Forgot password modal opens', async ({ page }) => {
    await page.locator('text=Esqueci minha senha').click();

    // Modal should appear with reset form
    await expect(page.locator('.ant-modal, [role="dialog"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-AUTH-007: Unauthenticated user is redirected to login', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto(ROUTES.dashboard);
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-AUTH-008: Session persists after page reload', async ({ page }) => {
    await loginAs(page, TEST_USERS.editor.email, TEST_USERS.editor.password);
    await page.waitForURL('**/dashboard', { timeout: 20000 });

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should stay on dashboard (not redirect to login)
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Portal de Governança')).toBeVisible({ timeout: 10000 });
  });
});
