/**
 * CYPRESS E2E: Authentication Test Suite
 * Full user flow for login, signup, password reset
 */

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('[data-testid="login-email-input"]', { timeout: 15000 }).should('exist');
  });

  it('TC-CY-AUTH-001: Login page loads with all elements', () => {
    cy.contains('Agenda QA').should('be.visible');
    cy.contains('Login').should('be.visible');
    cy.contains('Cadastro').should('be.visible');
    cy.get('[data-testid="login-email-input"]').should('exist');
    cy.get('[data-testid="login-password-input"]').should('exist');
    cy.get('[data-testid="login-submit-button"]').should('exist');
    cy.contains('Esqueci minha senha').should('be.visible');
  });

  it('TC-CY-AUTH-002: Valid login redirects to dashboard', () => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.editor.email, users.editor.password);
      // After programmatic login and redirect, should not be on login page
      cy.url().should('not.include', '/login');
    });
  });

  it('TC-CY-AUTH-003: Invalid login stays on login page', () => {
    cy.get('[data-testid="login-email-input"]')
      .type('invalid@test.com');
    cy.get('[data-testid="login-password-input"]')
      .type('wrongpassword');
    cy.get('[data-testid="login-submit-button"]')
      .click();

    cy.get('div[data-testid="login-form"]').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('TC-CY-AUTH-004: Empty form shows validation', () => {
    cy.get('[data-testid="login-submit-button"]')
      .click();
    cy.contains('Insira seu email').should('be.visible');
  });

  it('TC-CY-AUTH-005: Signup tab shows registration form', () => {
    cy.contains('Cadastro').click();
    cy.get('[data-testid="signup-submit-button"]', { timeout: 5000 }).should('exist');
  });

  it('TC-CY-AUTH-006: Forgot password modal opens', () => {
    cy.contains('Esqueci minha senha').click();
    cy.get('.ant-modal, [role="dialog"]', { timeout: 5000 }).should('be.visible');
  });

  it('TC-CY-AUTH-007: Unauthenticated access to /dashboard redirects to login', () => {
    cy.visit('/dashboard');
    cy.get('div[data-testid="login-form"]').should('be.visible');
    cy.url().should('include', '/login');
  });
});
