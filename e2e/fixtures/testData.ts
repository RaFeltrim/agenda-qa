// Test data fixtures for consistent test runs

export interface TestUser {
  username: string;
  password: string;
  role: 'editor' | 'viewer';
  fullName: string;
}

export interface TestCard {
  title: string;
  description: string;
  status: 'backlog' | 'em-progresso' | 'bloqueado' | 'concluido';
}

export const TEST_USERS: Record<string, TestUser> = {
  editor1: {
    username: 'Board_RFeltrim',
    password: 'TestEditor123!',
    role: 'editor',
    fullName: 'Rafael Feltrim'
  },
  editor2: {
    username: 'Board_MCordeiro',
    password: 'TestEditor456!',
    role: 'editor',
    fullName: 'Mauricio Cordeiro'
  },
  viewer1: {
    username: 'Board_FCustodio',
    password: 'TestViewer123!',
    role: 'viewer',
    fullName: 'Fabiana Custodio'
  },
  viewer2: {
    username: 'Board_JPaulo',
    password: 'TestViewer456!',
    role: 'viewer',
    fullName: 'Joao Paulo'
  }
};

export const TEST_CARDS: TestCard[] = [
  {
    title: 'Test Feature Implementation',
    description: 'Implement new feature for user authentication',
    status: 'backlog'
  },
  {
    title: 'Bug Fix - Login Issue',
    description: 'Fix authentication bug causing login failures',
    status: 'em-progresso'
  },
  {
    title: 'Security Enhancement',
    description: 'Add additional security measures to protect user data',
    status: 'bloqueado'
  },
  {
    title: 'Documentation Update',
    description: 'Update user documentation with new features',
    status: 'concluido'
  }
];

export const INVALID_CREDENTIALS = {
  username: 'invalid_user',
  password: 'wrong_password'
};

export const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

export const VALID_PASSWORD_EXAMPLE = 'ValidPass123!';

export const INVALID_PASSWORDS = [
  'short', // too short
  'nouppercase123!', // no uppercase
  'NOLOWERCASE123!', // no lowercase
  'NoSpecialChars123', // no special chars
  'NoNumbers!@#', // no numbers
  'VALIDPASS123!' // valid (for negative testing)
];

// Test scenarios
export const AUTH_SCENARIOS = {
  happyPath: {
    description: 'Valid user login with correct credentials',
    user: TEST_USERS.editor1,
    expectedOutcome: 'successful_login'
  },
  firstLogin: {
    description: 'First time login requiring password change',
    user: TEST_USERS.editor2,
    expectedOutcome: 'password_change_required'
  },
  invalidCredentials: {
    description: 'Login attempt with invalid username/password',
    user: INVALID_CREDENTIALS,
    expectedOutcome: 'login_failed'
  },
  viewerAccess: {
    description: 'Viewer role accessing the system',
    user: TEST_USERS.viewer1,
    expectedOutcome: 'limited_access'
  }
};

// RBAC test cases
export const RBAC_TEST_CASES = [
  {
    role: 'editor',
    canCreateCards: true,
    canEditCards: true,
    canDeleteCards: true,
    canManageUsers: true
  },
  {
    role: 'viewer',
    canCreateCards: false,
    canEditCards: false,
    canDeleteCards: false,
    canManageUsers: false
  }
];

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  pageLoadTime: 3000, // ms
  apiResponseTime: 1000, // ms
  searchResponseTime: 500, // ms
  dragDropTime: 1000 // ms
};