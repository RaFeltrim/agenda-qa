/**
 * CYPRESS E2E: Navigation & Access Control
 * Routes, guards, profile, admin
 */

describe('Navigation & Profile', () => {
  beforeEach(() => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.editor.email, users.editor.password);
    });
  });

  it('TC-CY-NAV-001: Profile page loads', () => {
    cy.visit('/profile');
    cy.get('input', { timeout: 10000 }).should('exist');
  });

  it('TC-CY-NAV-002: Root / redirects to /dashboard', () => {
    cy.visit('/');
    cy.url({ timeout: 5000 }).should('include', '/dashboard');
  });

  it('TC-CY-NAV-003: ProLayout sidebar is visible', () => {
    cy.get('.ant-pro-sider, .ant-layout-sider, [class*="sider"]', { timeout: 10000 })
      .should('exist');
  });
});

describe('Access Control - Non-Admin', () => {
  beforeEach(() => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.editor.email, users.editor.password);
    });
  });

  it('TC-CY-GUARD-001: Non-admin sees "Acesso Negado" on /admin/users', () => {
    cy.visit('/admin/users');
    cy.wait(3000);

    // Should show access denied or redirect
    cy.url().then(url => {
      if (url.includes('/admin/users')) {
        cy.contains('Acesso Negado').should('be.visible');
      } else {
        expect(url).to.include('/dashboard');
      }
    });
  });
});
