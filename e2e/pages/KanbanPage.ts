import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class KanbanPage extends BasePage {
  // Column locators
  private getBacklogColumn(): Locator {
    return this.page.getByTestId('column-backlog');
  }

  private getInProgressColumn(): Locator {
    return this.page.getByTestId('column-in-progress');
  }

  private getBlockedColumn(): Locator {
    return this.page.getByTestId('column-blocked');
  }

  private getDoneColumn(): Locator {
    return this.page.getByTestId('column-done');
  }

  // Card locators
  private getCreateCardButton(): Locator {
    return this.page.getByTestId('create-card-button');
  }

  private getCardTitleInput(): Locator {
    return this.page.getByTestId('card-title-input');
  }

  private getCardDescriptionTextarea(): Locator {
    return this.page.getByTestId('card-description-textarea');
  }

  private getCreateCardSubmitButton(): Locator {
    return this.page.getByTestId('create-card-submit');
  }

  private getCardByTitle(title: string): Locator {
    return this.page.getByTestId(`card-${title.replace(/\s+/g, '-').toLowerCase()}`);
  }

  // Search and filter
  private getSearchInput(): Locator {
    return this.page.getByTestId('search-input');
  }

  private getKanbanThemeToggle(): Locator {
    return this.page.getByTestId('theme-toggle');
  }

  // Actions
  async createCard(title: string, description: string): Promise<void> {
    await this.clickElement(this.getCreateCardButton());
    await this.fillInput(this.getCardTitleInput(), title);
    await this.fillInput(this.getCardDescriptionTextarea(), description);
    await this.clickElement(this.getCreateCardSubmitButton());
    await this.page.waitForTimeout(1000); // Wait for card to appear
  }

  async moveCardToColumn(cardTitle: string, targetColumn: 'backlog' | 'in-progress' | 'blocked' | 'done'): Promise<void> {
    const card = this.getCardByTitle(cardTitle);
    let targetColumnElement: Locator;

    switch (targetColumn) {
      case 'backlog':
        targetColumnElement = this.getBacklogColumn();
        break;
      case 'in-progress':
        targetColumnElement = this.getInProgressColumn();
        break;
      case 'blocked':
        targetColumnElement = this.getBlockedColumn();
        break;
      case 'done':
        targetColumnElement = this.getDoneColumn();
        break;
      default:
        throw new Error(`Invalid column: ${targetColumn}`);
    }

    await card.dragTo(targetColumnElement);
    await this.page.waitForTimeout(500); // Wait for drop animation
  }

  async searchCards(searchTerm: string): Promise<void> {
    await this.fillInput(this.getSearchInput(), searchTerm);
    await this.page.waitForTimeout(500); // Wait for search results
  }

  async toggleTheme(): Promise<void> {
    await this.clickElement(this.getKanbanThemeToggle());
  }

  async getVisibleCardsCount(): Promise<number> {
    return await this.page.getByTestId(/^card-/).count();
  }

  async isCardVisible(cardTitle: string): Promise<boolean> {
    return await this.getCardByTitle(cardTitle).isVisible();
  }

  // Assertions
  async assertKanbanBoardLoaded(): Promise<void> {
    await this.getBacklogColumn().waitFor({ state: 'visible' });
    await this.getInProgressColumn().waitFor({ state: 'visible' });
    await this.getBlockedColumn().waitFor({ state: 'visible' });
    await this.getDoneColumn().waitFor({ state: 'visible' });
  }

  async assertCardExists(cardTitle: string): Promise<void> {
    const isVisible = await this.isCardVisible(cardTitle);
    if (!isVisible) {
      throw new Error(`Card "${cardTitle}" should be visible but is not`);
    }
  }

  async assertCardInColumn(cardTitle: string, column: string): Promise<void> {
    const card = this.getCardByTitle(cardTitle);
    const columnElement = this.getColumnByType(column as any);
    
    // Check if card is within the column
    const isInColumn = await card.evaluate((cardEl, columnSelector) => {
      const columnEl = document.querySelector(columnSelector as string);
      return columnEl?.contains(cardEl) || false;
    }, `[data-testid="column-${column}"]`);

    if (!isInColumn) {
      throw new Error(`Card "${cardTitle}" should be in column "${column}"`);
    }
  }

  async assertSearchResultsContain(expectedText: string): Promise<void> {
    const searchResults = await this.page.getByTestId(/^card-/).allTextContents();
    const hasMatch = searchResults.some(text => text.includes(expectedText));
    
    if (!hasMatch) {
      throw new Error(`Search results should contain "${expectedText}"`);
    }
  }

  // Helper methods
  private getColumnByType(type: 'backlog' | 'in-progress' | 'blocked' | 'done'): Locator {
    switch (type) {
      case 'backlog': return this.getBacklogColumn();
      case 'in-progress': return this.getInProgressColumn();
      case 'blocked': return this.getBlockedColumn();
      case 'done': return this.getDoneColumn();
      default: throw new Error(`Invalid column type: ${type}`);
    }
  }
}