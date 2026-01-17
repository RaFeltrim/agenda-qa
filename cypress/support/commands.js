// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login as editor
Cypress.Commands.add('loginAsEditor', () => {
  cy.visit('/')
  // Add login logic here when authentication is implemented
})

// Custom command to login as viewer
Cypress.Commands.add('loginAsViewer', () => {
  cy.visit('/')
  // Add viewer login logic here
})

// Custom command to create a test card
Cypress.Commands.add('createTestCard', (title, description) => {
  cy.contains('button', 'Novo Card').click()
  cy.get('[data-testid="card-title-input"]').type(title)
  cy.get('[data-testid="card-description-textarea"]').type(description)
  cy.contains('button', 'Criar Card').click()
})

// Custom command to drag and drop a card
Cypress.Commands.add('dragCardToColumn', (cardTitle, targetColumn) => {
  cy.contains('.card', cardTitle).trigger('dragstart')
  cy.contains('.column', targetColumn).trigger('drop')
})

// Custom command to clear all test data
Cypress.Commands.add('clearTestData', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
    win.sessionStorage.clear()
  })
})