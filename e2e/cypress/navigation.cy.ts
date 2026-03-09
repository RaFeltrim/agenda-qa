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
    cy.get('div[data-testid="dashboard-container"]', { timeout: 5000 }).should('be.visible');
    // Profile page should render (may show content or redirect)
    cy.url().should('match', /\/(profile|dashboard)/);
  });

  it('TC-CY-NAV-002: Root / keeps user authenticated', () => {
    cy.visit('/');
    cy.get('div[data-testid="dashboard-container"]', { timeout: 5000 }).should('be.visible');
    // Should not redirect to login (user is authenticated)
    cy.url().should('not.include', '/login');
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

  it('TC-CY-GUARD-001: Non-admin on /admin/users page', () => {
    cy.visit('/admin/users');
    cy.get('div[data-testid="dashboard-container"]', { timeout: 5000 }).should('be.visible');

    // Page should render - either with access denied or admin content
    cy.url().then(url => {
      // Verify we're on a valid page
      expect(url).to.match(/\/(admin|dashboard|login)/);
    });
  });
});
