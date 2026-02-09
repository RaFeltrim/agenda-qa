/**
 * CYPRESS E2E: Dashboard Test Suite
 * KanbanBoard, TaskBoard, ViewToggle, Meetings
 */

describe('Dashboard - Reuniões (KanbanBoard)', () => {
  beforeEach(() => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.editor.email, users.editor.password);
    });
  });

  it('TC-CY-DASH-001: Dashboard loads with title and description', () => {
    cy.contains('Portal de Governança').should('be.visible');
    cy.contains('Gerencie suas reuniões').should('be.visible');
  });

  it('TC-CY-DASH-002: KanbanBoard is visible by default', () => {
    cy.get('[data-testid="kanban-board"]', { timeout: 10000 }).should('be.visible');
  });

  it('TC-CY-DASH-003: KanbanBoard has status columns', () => {
    cy.get('[data-testid="kanban-board"]', { timeout: 10000 }).should('be.visible');
    const expectedColumns = ['Agendada', 'Em Andamento', 'Concluída', 'Cancelada'];
    expectedColumns.forEach(col => {
      cy.contains(col).should('exist');
    });
  });

  it('TC-CY-DASH-004: "Nova Reunião" button exists', () => {
    cy.get('[data-testid="new-meeting-btn"]', { timeout: 10000 }).should('be.visible');
  });

  it('TC-CY-DASH-005: New Meeting button opens modal', () => {
    cy.get('[data-testid="new-meeting-btn"]').click();
    cy.get('[data-testid="meeting-modal"], .ant-modal', { timeout: 5000 })
      .should('be.visible');
  });

  it('TC-CY-DASH-006: Meeting modal has title and save', () => {
    cy.get('[data-testid="new-meeting-btn"]').click();
    cy.get('[data-testid="meeting-title-input"]', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="meeting-modal-save"]', { timeout: 5000 }).should('exist');
  });
});

describe('Dashboard - Tarefas (TaskBoard)', () => {
  beforeEach(() => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.editor.email, users.editor.password);
    });
  });

  it('TC-CY-TASK-001: View toggle switches to TaskBoard', () => {
    cy.get('[data-testid="view-toggle-switch"]', { timeout: 10000 }).click();
    cy.get('[data-testid="task-board"]', { timeout: 10000 }).should('be.visible');
  });

  it('TC-CY-TASK-002: TaskBoard has 5 status columns', () => {
    cy.get('[data-testid="view-toggle-switch"]').click();
    cy.get('[data-testid="task-board"]', { timeout: 10000 }).should('be.visible');

    const columns = ['Backlog', 'A Fazer', 'Em Progresso', 'Bloqueada', 'Concluída'];
    columns.forEach(col => {
      cy.contains(col).should('exist');
    });
  });

  it('TC-CY-TASK-003: Sprint selector shows "Selecione uma Sprint"', () => {
    cy.get('[data-testid="view-toggle-switch"]').click();
    cy.contains('Selecione uma Sprint', { timeout: 10000 }).should('exist');
  });

  it('TC-CY-TASK-004: Default view shows "Backlog Geral"', () => {
    cy.get('[data-testid="view-toggle-switch"]').click();
    cy.contains('Backlog Geral', { timeout: 10000 }).should('be.visible');
  });
});
