// Cypress E2E support file
// Global commands and configuration

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

/** Custom command: Login via UI */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-testid="login-email-input"]')
    .should('be.visible')
    .clear()
    .type(email);
  cy.get('[data-testid="login-password-input"]')
    .clear()
    .type(password);
  cy.get('[data-testid="login-submit-button"]')
    .click();
  cy.url({ timeout: 20000 }).should('include', '/dashboard');
});

export {};
