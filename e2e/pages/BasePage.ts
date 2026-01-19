import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  // Common locators
  protected getHeader(): Locator {
    return this.page.locator('header');
  }

  protected getMainContent(): Locator {
    return this.page.locator('main');
  }

  protected getDashboard(): Locator {
    return this.page.getByTestId('dashboard');
  }

  protected getThemeToggle(): Locator {
    return this.page.getByTestId('theme-toggle');
  }

  // Common actions
  async navigateTo(path: string = '/'): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Allow for animations
  }

  async clickElement(locator: Locator): Promise<void> {
    await locator.click();
  }

  async fillInput(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async getText(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  // Error handling
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  async getErrorMessage(): Promise<string> {
    const errorLocator = this.page.getByTestId('error-message');
    return await errorLocator.textContent() || '';
  }
}