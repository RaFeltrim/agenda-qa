import { supabase } from './supabase';
import type { User } from '../types';

// Password strength validation
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export interface AuthResponse {
  user: User | null;
  profile: Profile | null;
  role: 'admin' | 'user' | 'viewer' | null;
  error: string | null;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'user' | 'viewer';
  first_login?: boolean;
  created_at: string;
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

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

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        user: null,
        profile: null,
        role: null,
        error: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password' 
          : error.message,
      };
    }

    if (!data.user) {
      return {
        user: null,
        profile: null,
        role: null,
        error: 'Authentication failed',
      };
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profileData) {
      return {
        user: data.user as unknown as User,
        profile: null,
        role: null,
        error: 'User profile not found',
      };
    }

    return {
      user: data.user as unknown as User,
      profile: profileData,
      role: profileData.role,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      profile: null,
      role: null,
      error: 'Unexpected error during login',
    };
  }
};

export const signUp = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        user: null,
        profile: null,
        role: null,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        user: null,
        profile: null,
        role: null,
        error: 'Sign up failed',
      };
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: email,
        full_name: email.split('@')[0],
        role: 'user',
        first_login: true,
      })
      .select()
      .single();

    return {
      user: data.user as unknown as User,
      profile: profileData,
      role: 'user',
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      profile: null,
      role: null,
      error: 'Unexpected error during sign up',
    };
  }
};

export const changePassword = async (newPassword: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors[0] || 'Invalid password',
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('profiles')
        .update({
          first_login: false,
          password_changed_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      error: 'Unexpected error changing password',
    };
  }
};

export const logout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut({ scope: 'global' });
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/login');
  } catch (error) {
    console.error('Logout error:', error);
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/login');
  }
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        profile: null,
        role: null,
        error: error?.message || 'Not authenticated',
      };
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      return {
        user: null,
        profile: null,
        role: null,
        error: 'User profile not found',
      };
    }

    return {
      user: user as unknown as User,
      profile: profileData,
      role: profileData.role,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      profile: null,
      role: null,
      error: 'Error fetching current user',
    };
  }
};

export const needsPasswordChange = (profile: Profile | null): boolean => {
  return profile?.first_login === true;
};

export const resetPassword = async (email: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      error: 'Unexpected error sending password reset email',
    };
  }
};
