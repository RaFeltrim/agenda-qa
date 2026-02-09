/**
 * Shared test fixtures and helpers for Playwright E2E tests
 * Agenda-QA Project
 */

export const TEST_USERS = {
  admin: {
    email: 'admin_sarah@agenda-qa.internal',
    password: 'AdminPass123!',
    role: 'admin',
  },
  editor: {
    email: 'rafael.feltrim@agenda-qa.internal',
    password: 'DemoPass123',
    role: 'user',
  },
  viewer: {
    email: 'viewer_john@agenda-qa.internal',
    password: 'ViewerPass123!',
    role: 'viewer',
  },
} as const;

export const SELECTORS = {
  login: {
    emailInput: '[data-testid="login-email-input"]',
    passwordInput: '[data-testid="login-password-input"]',
    submitButton: '[data-testid="login-submit-button"]',
    signupButton: '[data-testid="signup-submit-button"]',
  },
  dashboard: {
    viewToggle: '[data-testid="view-toggle-switch"]',
    kanbanBoard: '[data-testid="kanban-board"]',
    taskBoard: '[data-testid="task-board"]',
    newMeetingBtn: '[data-testid="new-meeting-btn"]',
  },
  meeting: {
    modal: '[data-testid="meeting-modal"]',
    titleInput: '[data-testid="meeting-title-input"]',
    dateInput: '[data-testid="meeting-date-input"]',
    timeInput: '[data-testid="meeting-time-input"]',
    statusSelect: '[data-testid="meeting-status-select"]',
    linkInput: '[data-testid="meeting-link-input"]',
    descInput: '[data-testid="meeting-desc-input"]',
    saveButton: '[data-testid="meeting-modal-save"]',
  },
} as const;

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  profile: '/profile',
  settings: '/settings',
  adminUsers: '/admin/users',
} as const;
