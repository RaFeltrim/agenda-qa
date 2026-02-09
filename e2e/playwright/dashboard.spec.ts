import { test, expect, type Page } from '@playwright/test';
import { TEST_USERS, SELECTORS, ROUTES } from './fixtures';

/**
 * DASHBOARD E2E TESTS
 * Tests: KanbanBoard, TaskBoard, ViewToggle, Navigation
 */

/** Helper: login and navigate to dashboard */
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

test.describe('Dashboard - KanbanBoard (Reuniões)', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoToDashboard(page);
  });

  test('TC-DASH-001: Dashboard loads with Portal de Governança title', async ({ page }) => {
    await expect(page.locator('text=Portal de Governança')).toBeVisible();
    await expect(page.locator('text=Gerencie suas reuniões')).toBeVisible();
  });

  test('TC-DASH-002: Kanban board is visible by default (Reuniões view)', async ({ page }) => {
    const kanban = page.locator(SELECTORS.dashboard.kanbanBoard);
    await expect(kanban).toBeVisible({ timeout: 10000 });
  });

  test('TC-DASH-003: KanbanBoard has expected columns', async ({ page }) => {
    const kanban = page.locator(SELECTORS.dashboard.kanbanBoard);
    await expect(kanban).toBeVisible({ timeout: 10000 });

    // KanbanBoard should have meeting status columns
    const columns = ['Agendada', 'Em Andamento', 'Concluída', 'Cancelada'];
    for (const col of columns) {
      await expect(page.locator(`text=${col}`).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-DASH-004: "Nova Reunião" button is visible', async ({ page }) => {
    const newMeetingBtn = page.locator(SELECTORS.dashboard.newMeetingBtn);
    await expect(newMeetingBtn).toBeVisible({ timeout: 10000 });
  });

  test('TC-DASH-005: Clicking "Nova Reunião" opens meeting modal', async ({ page }) => {
    const newMeetingBtn = page.locator(SELECTORS.dashboard.newMeetingBtn);
    await newMeetingBtn.click();

    // Meeting modal should appear
    const modal = page.locator(`${SELECTORS.meeting.modal}, .ant-modal`).first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('TC-DASH-006: Meeting modal has all required fields', async ({ page }) => {
    await page.locator(SELECTORS.dashboard.newMeetingBtn).click();

    // Check all form fields exist
    await expect(page.locator(SELECTORS.meeting.titleInput).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator(SELECTORS.meeting.saveButton).first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Dashboard - TaskBoard (Tarefas)', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoToDashboard(page);
  });

  test('TC-TASK-001: View toggle switches to Tasks view', async ({ page }) => {
    // Click the toggle to switch to tasks
    const toggle = page.locator(SELECTORS.dashboard.viewToggle);
    await expect(toggle).toBeVisible({ timeout: 10000 });
    await toggle.click();

    // TaskBoard should now be visible
    await expect(page.locator(SELECTORS.dashboard.taskBoard)).toBeVisible({ timeout: 10000 });
  });

  test('TC-TASK-002: TaskBoard has 5 status columns', async ({ page }) => {
    await page.locator(SELECTORS.dashboard.viewToggle).click();
    await page.waitForTimeout(1000);

    const taskBoard = page.locator(SELECTORS.dashboard.taskBoard);
    await expect(taskBoard).toBeVisible({ timeout: 10000 });

    // 5 columns: Backlog, A Fazer, Em Progresso, Bloqueada, Concluída
    const columns = ['Backlog', 'A Fazer', 'Em Progresso', 'Bloqueada', 'Concluída'];
    for (const col of columns) {
      await expect(page.locator(`text=${col}`).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-TASK-003: Sprint selector is visible in TaskBoard', async ({ page }) => {
    await page.locator(SELECTORS.dashboard.viewToggle).click();
    await page.waitForTimeout(1000);

    // Sprint select dropdown
    await expect(page.locator('text=Selecione uma Sprint').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-TASK-004: TaskBoard shows Backlog Geral when no sprint selected', async ({ page }) => {
    await page.locator(SELECTORS.dashboard.viewToggle).click();
    await page.waitForTimeout(1000);

    await expect(page.locator('text=Backlog Geral').first()).toBeVisible({ timeout: 10000 });
  });
});
