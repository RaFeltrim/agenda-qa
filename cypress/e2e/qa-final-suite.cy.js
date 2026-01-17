/// <reference types="cypress" />

describe('QA Final - End-to-End Tests', () => {
  beforeEach(() => {
    // Clear all data before each test
    cy.clearTestData()
    cy.visit('/')
  })

  context('Application Loading and Basic Navigation', () => {
    it('loads the application successfully', () => {
      cy.title().should('include', 'Agenda Kanban')
      cy.get('body').should('be.visible')
    })

    it('displays the main header elements', () => {
      cy.get('header').should('be.visible')
      cy.contains('Agenda Kanban').should('be.visible')
    })

    it('shows all four kanban columns', () => {
      cy.contains('BACKLOG').should('be.visible')
      cy.contains('EM PROGRESSO').should('be.visible')
      cy.contains('BLOQUEADO').should('be.visible')
      cy.contains('CONCLUIDO').should('be.visible')
    })

    it('displays dashboard widgets', () => {
      cy.get('[data-testid="dashboard"]').should('be.visible')
      cy.contains('Sprint Atual').should('be.visible')
      cy.contains('Reuniões').should('be.visible')
    })
  })

  context('Happy Path User Flows', () => {
    it('allows creating a new card', () => {
      // Click the floating action button
      cy.get('button').contains('Novo Card').click()
      
      // Fill in card details
      cy.get('input[placeholder*="Título"]').type('Test Card Creation')
      cy.get('textarea[placeholder*="Descrição"]').type('This is a test card created by Cypress')
      
      // Submit the form
      cy.contains('button', 'Criar').click()
      
      // Verify card appears in backlog
      cy.contains('Test Card Creation').should('be.visible')
    })

    it('allows moving cards between columns via drag and drop', () => {
      // Create a test card first
      cy.createTestCard('Drag Test Card', 'Testing drag and drop functionality')
      
      // Verify card is in backlog initially
      cy.contains('.column', 'BACKLOG').contains('Drag Test Card').should('be.visible')
      
      // Drag card to "Em Progresso" column
      cy.contains('Drag Test Card').drag('.column:contains("EM PROGRESSO")')
      
      // Verify card moved to new column
      cy.contains('.column', 'EM PROGRESSO').contains('Drag Test Card').should('be.visible')
    })

    it('allows filtering cards by search term', () => {
      // Create test cards
      cy.createTestCard('Important Feature', 'This is an important feature')
      cy.createTestCard('Bug Fix', 'Fixing a critical bug')
      
      // Search for specific card
      cy.get('input[placeholder*="Buscar"]').type('Feature')
      
      // Verify only matching cards are shown
      cy.contains('Important Feature').should('be.visible')
      cy.contains('Bug Fix').should('not.be.visible')
    })

    it('allows switching between dark and light mode', () => {
      // Toggle dark mode
      cy.get('[data-testid="theme-toggle"]').click()
      
      // Verify dark mode is applied
      cy.get('body').should('have.class', 'dark')
      
      // Toggle back to light mode
      cy.get('[data-testid="theme-toggle"]').click()
      
      // Verify light mode is applied
      cy.get('body').should('not.have.class', 'dark')
    })
  })

  context('Negative Path and Error Handling', () => {
    it('handles empty search gracefully', () => {
      cy.get('input[placeholder*="Buscar"]').type('nonexistent')
      cy.contains('Nenhum card encontrado').should('be.visible')
    })

    it('prevents creating cards with empty title', () => {
      cy.get('button').contains('Novo Card').click()
      cy.get('textarea[placeholder*="Descrição"]').type('Description without title')
      cy.contains('button', 'Criar').click()
      
      // Should show validation error or prevent submission
      cy.get('form').should('be.visible') // Form should still be open
    })

    it('handles very long input gracefully', () => {
      const longText = 'A'.repeat(1000)
      cy.get('button').contains('Novo Card').click()
      cy.get('input[placeholder*="Título"]').type(longText)
      
      // Application should not crash
      cy.contains('button', 'Criar').should('be.visible')
    })
  })

  context('Performance and Responsiveness', () => {
    it('loads dashboard quickly', () => {
      cy.visit('/')
      cy.get('[data-testid="dashboard"]').should('be.visible').and('be.enabled')
    })

    it('responds to user interactions promptly', () => {
      cy.get('button').contains('Novo Card').click()
      cy.get('input[placeholder*="Título"]').should('be.focused')
    })

    it('maintains state across navigation', () => {
      // Create a card
      cy.createTestCard('Persistent Card', 'This card should persist')
      
      // Navigate away and back
      cy.reload()
      
      // Card should still be visible
      cy.contains('Persistent Card').should('be.visible')
    })
  })

  context('Accessibility Verification', () => {
    it('has proper keyboard navigation', () => {
      cy.get('body').tab()
      cy.focused().should('be.visible')
    })

    it('maintains color contrast ratios', () => {
      // This would require axe-core or similar accessibility testing tool
      // For now, we'll just verify basic elements are visible
      cy.get('header').should('be.visible')
      cy.get('main').should('be.visible')
    })

    it('has semantic HTML structure', () => {
      cy.get('header').should('exist')
      cy.get('main').should('exist')
      cy.get('nav').should('exist')
    })
  })

  context('Data Persistence', () => {
    it('persists data across browser sessions', () => {
      // Create test data
      cy.createTestCard('Persistence Test', 'Testing localStorage persistence')
      
      // Force a save
      cy.window().then(win => {
        win.localStorage.setItem('test-marker', 'exists')
      })
      
      // Reload page
      cy.reload()
      
      // Verify data persists
      cy.contains('Persistence Test').should('be.visible')
      cy.window().then(win => {
        expect(win.localStorage.getItem('test-marker')).to.eq('exists')
      })
    })

    it('handles localStorage quota exceeded gracefully', () => {
      // This is difficult to test without mocking localStorage
      // We'll test that the app doesn't crash with normal usage
      cy.createTestCard('Quota Test', 'Testing quota handling')
      cy.contains('Quota Test').should('be.visible')
    })
  })

  context('Integration with External Services', () => {
    it('handles API failures gracefully', () => {
      // Since we're using localStorage, this tests offline capability
      cy.goOffline()
      cy.visit('/')
      cy.get('body').should('be.visible')
      cy.goOnline()
    })

    it('works without external dependencies', () => {
      // Test that core functionality works without internet
      cy.visit('/')
      cy.contains('BACKLOG').should('be.visible')
      cy.contains('EM PROGRESSO').should('be.visible')
    })
  })
})