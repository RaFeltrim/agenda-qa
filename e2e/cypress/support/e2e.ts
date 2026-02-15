// Cypress E2E support file
// Global commands and configuration

const SUPABASE_URL = 'https://njbtlnhhsspxjscyzoxp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CLmMh3eb3XfADPku94kcSQ_flQJrRnI';

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

/**
 * Custom command: Cypress-aware login.
 *
 * The app's useAuth hook detects window.Cypress and reads the session
 * directly from localStorage, bypassing all Supabase network calls
 * (which hang in Cypress headless).
 *
 * Steps:
 * 1. Get a real token via cy.request() (bypasses browser)
 * 2. Set localStorage with session data
 * 3. Visit /dashboard — the app reads localStorage, sets user, skips loading
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  // Step 1: Get real token via cy.request()
  cy.request({
    method: 'POST',
    url: `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: { email, password },
  }).then((response) => {
    expect(response.status).to.eq(200);
    const { access_token, refresh_token, expires_in, expires_at, token_type, user } = response.body;

    // Step 2: Build session data for localStorage
    const sessionData = JSON.stringify({
      access_token,
      refresh_token,
      expires_in,
      expires_at,
      token_type,
      user,
    });

    // Step 3: Visit /dashboard with localStorage pre-set
    cy.visit('/dashboard', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'sb-njbtlnhhsspxjscyzoxp-auth-token',
          sessionData
        );
      },
    });

    // Step 4: Wait for the ProLayout to render (auth resolved via localStorage)
    cy.get('.ant-pro-layout, .ant-layout', { timeout: 15000 }).should('exist');

    // Stabilization
    cy.get('.ant-pro-layout, .ant-layout').should('be.visible');
  });
});

export {};
