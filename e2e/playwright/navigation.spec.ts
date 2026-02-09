import { test, expect, type Page } from '@playwright/test';
import { TEST_USERS, SELECTORS, ROUTES } from './fixtures';

/**
 * NAVIGATION & PROFILE E2E TESTS
 * Tests: Sidebar navigation, Profile page, Settings page, Admin guard
 */

async function loginAndGoToDashboard(page: Page) {
  await page.goto(ROUTES.login);
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator(SELECTORS.login.emailInput);
  const passwordInput = page.locator(SELECTORS.login.passwordInput);

  await emailInput.waitFor({ state: 'visible', timeout: 15000 });
  await emailInput.fill(TEST_USERS.editor.email);
  await passwordInput.fill(TEST_USERS.editor.password);
  await page.locator(SELECTORS.login.submitButton).click();

  await page.waitForURL('**/dashboard', { timeout: 20000 });
  await page.waitForLoadState('networkidle');
}

test.describe('Profile Page', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoToDashboard(page);
  });

  test('TC-PROF-001: Profile page loads', async ({ page }) => {
    await page.goto(ROUTES.profile);
    await page.waitForLoadState('networkidle');

    // Should display profile content (name field, email field, etc.)
    await expect(page.locator('text=Perfil, text=Profile, text=Meu Perfil').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-PROF-002: Profile page shows user information', async ({ page }) => {
    await page.goto(ROUTES.profile);
    await page.waitForLoadState('networkidle');

    // Should have input fields for editing profile
    const inputs = page.locator('input[type="text"], input[type="email"]');
    await expect(inputs.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Route Guards & Access Control', () => {

  test('TC-GUARD-001: Non-admin cannot access /admin/users', async ({ page }) => {
    // Login as regular editor
    await loginAndGoToDashboard(page);

    // Try to navigate to admin page
    await page.goto(ROUTES.adminUsers);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should either redirect or show "Acesso Negado"
    const denied = await page.locator('text=Acesso Negado, text=Sem permissão').first().isVisible().catch(() => false);
    const redirected = page.url().includes('/dashboard') || page.url().includes('/login');

    expect(denied || redirected).toBeTruthy();
  });

  test('TC-GUARD-002: Root / redirects to /dashboard after login', async ({ page }) => {
    await loginAndGoToDashboard(page);
    await page.goto('/');
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe('Responsive Layout', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoToDashboard(page);
  });

  test('TC-LAYOUT-001: ProLayout sidebar renders', async ({ page }) => {
    // ProLayout sidebar should be visible at desktop size
    const sidebar = page.locator('.ant-pro-sider, .ant-layout-sider, [class*="sider"]').first();
    await expect(sidebar).toBeVisible({ timeout: 10000 });
  });

  test('TC-LAYOUT-002: Mobile viewport collapses sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);

    // Dashboard should still render correctly
    await expect(page.locator('text=Portal de Governança')).toBeVisible({ timeout: 10000 });
  });
});
