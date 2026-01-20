import { supabase, AuthResponse, Profile } from './supabaseClient';

// Password strength validation
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

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial (!@#$%^&*)');
  }

  // Strength calculation
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  const criteriaMet = 5 - errors.length;

  if (criteriaMet >= 4) strength = 'strong';
  else if (criteriaMet >= 3) strength = 'medium';

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
};

// Convert username to email format
const usernameToEmail = (username: string): string => {
  return `${username}@agenda-qa.internal`;
};

// Sign in user
export const signIn = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    // Convert username to email
    const email = usernameToEmail(username);

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        user: null,
        profile: null,
        role: null,
        error:
          error.message === 'Invalid login credentials'
            ? 'Usuário ou senha inválidos'
            : error.message,
      };
    }

    if (!data.user) {
      return {
        user: null,
        profile: null,
        role: null,
        error: 'Falha na autenticação',
      };
    }

    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profileData) {
      return {
        user: data.user,
        profile: null,
        role: null,
        error: 'Perfil de usuário não encontrado',
      };
    }

    return {
      user: data.user,
      profile: profileData,
      role: profileData.role,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      profile: null,
      role: null,
      error: 'Erro inesperado durante o login',
    };
  }
};

// Change user password
export const changePassword = async (
  newPassword: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    // Validate password strength
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors[0] || 'Senha inválida', // Return first error or default message
      };
    }

    // Update password in Supabase
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Update profile to mark first login as completed
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_login: false,
          password_changed_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) {
        console.warn('Failed to update profile:', profileError);
        // Don't fail the whole operation for profile update
      }
    }

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      error: 'Erro inesperado ao alterar senha',
    };
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    // 1. Invalida sessão remota
    await supabase.auth.signOut({ scope: 'global' });
    
    // 2. Limpa estado local SEM exceções
    ['isAuthenticated', 'userRole', 'userId', 'lastProfile'].forEach(key => 
      localStorage.removeItem(key)
    );
    sessionStorage.clear();
    
    // 3. Redirect forçado (não usar navigate do React Router)
    window.location.replace('/login'); // replace = não volta com Back
  } catch (error) {
    // Fallback garante limpeza mesmo se Supabase falhar
    console.error('Logout error:', error);
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/login');
  }
};

// Get current authenticated user
export const getCurrentUser = async (): Promise<AuthResponse> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        profile: null,
        role: null,
        error: error?.message || 'Não autenticado',
      };
    }

    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // ❌ REMOVER fallback "genérico"
    // ✅ NOVA lógica: Se não tem profile completo, considera não autenticado
    if (profileError || !profileData) {
      return {
        user: null,
        profile: null,
        role: null,
        error: 'Perfil de usuário não encontrado',
      };
    }

    return {
      user,
      profile: profileData,
      role: profileData.role,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      profile: null,
      role: null,
      error: 'Erro ao buscar usuário atual',
    };
  }
};

// Check if user needs to change password (first login)
export const needsPasswordChange = (profile: Profile | null): boolean => {
  return profile?.first_login === true;
};
