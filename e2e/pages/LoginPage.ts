import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Locators
  private getUsernameInput(): Locator {
    return this.page.getByTestId('username-input');
  }

  private getPasswordInput(): Locator {
    return this.page.getByTestId('password-input');
  }

  private getLoginButton(): Locator {
    return this.page.getByTestId('login-button');
  }

  private getLoginErrorMessageElement(): Locator {
    return this.page.getByTestId('login-error');
  }

  private getFirstPasswordChangeModal(): Locator {
    return this.page.getByTestId('first-password-change-modal');
  }

  private getNewPasswordInput(): Locator {
    return this.page.getByTestId('new-password-input');
  }

  private getConfirmPasswordInput(): Locator {
    return this.page.getByTestId('confirm-password-input');
  }

  private getChangePasswordButton(): Locator {
    return this.page.getByTestId('change-password-button');
  }

  // Actions
  async login(username: string, password: string): Promise<void> {
    await this.navigateTo('/login');
    await this.fillInput(this.getUsernameInput(), username);
    await this.fillInput(this.getPasswordInput(), password);
    await this.clickElement(this.getLoginButton());
  }

  async isFirstPasswordChangeRequired(): Promise<boolean> {
    return await this.getFirstPasswordChangeModal().isVisible();
  }

  async changeFirstPassword(newPassword: string): Promise<void> {
    await this.fillInput(this.getNewPasswordInput(), newPassword);
    await this.fillInput(this.getConfirmPasswordInput(), newPassword);
    await this.clickElement(this.getChangePasswordButton());
  }

  async getLoginErrorMessage(): Promise<string> {
    return await this.getLoginErrorMessageElement().textContent() || '';
  }

  // Assertions
  async assertLoginPageVisible(): Promise<void> {
    await this.getUsernameInput().waitFor({ state: 'visible' });
    await this.getPasswordInput().waitFor({ state: 'visible' });
    await this.getLoginButton().waitFor({ state: 'visible' });
  }

  async assertLoginSuccessful(): Promise<void> {
    await this.page.waitForURL('**/dashboard', { timeout: 10000 });
  }

  async assertErrorMessageContains(expectedText: string): Promise<void> {
    const errorMessage = await this.getLoginErrorMessage();
    if (!errorMessage.includes(expectedText)) {
      throw new Error(`Expected error message to contain "${expectedText}", but got "${errorMessage}"`);
    }
  }
}