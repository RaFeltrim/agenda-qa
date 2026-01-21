// Mock authService to avoid import.meta.env issues

// Define types inline to avoid import issues
interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  username: string;
  role: string;
  first_login: boolean;
}

export interface AuthResponse {
  user: User | null;
  profile: Profile | null;
  role: string | null;
  error: string | null;
}
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  // Length check
  if (password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }

  // Simple mock validation
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
    strength = 'strong';
  } else if (password.length >= 6) {
    strength = 'medium';
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
};

// Mock sign in function
export const signIn = async (username: string, password: string): Promise<AuthResponse> => {
  // Mock successful login
  if (username === 'test_user' && password === 'TestPass123!') {
    return {
      user: {
        id: 'mock-user-id',
        email: `${username}@agenda-qa.internal`,
      },
      profile: {
        id: 'mock-profile-id',
        username: username,
        role: 'editor',
        first_login: false,
      },
      role: 'editor',
      error: null,
    };
  }
  
  // Mock failed login
  return {
    user: null,
    profile: null,
    role: null,
    error: 'Usuário ou senha inválidos',
  };
};

// Mock change password function
export const changePassword = async (
  newPassword: string
): Promise<{ success: boolean; error: string | null }> => {
  const validation = validatePassword(newPassword);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors[0] || 'Validação falhou',
    };
  }

  return {
    success: true,
    error: null,
  };
};

// Mock logout function
export const logout = async (): Promise<void> => {
  // Mock logout - no implementation needed
};

// Mock get current user function
export const getCurrentUser = async (): Promise<AuthResponse> => {
  return {
    user: null,
    profile: null,
    role: null,
    error: 'Não autenticado',
  };
};