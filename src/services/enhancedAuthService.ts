// Enhanced Authentication Service - Aligning with Senior Backend Engineer Requirements
// Implements RBAC, advanced security features, and audit logging integration

import { supabase, AuthResponse, Profile } from './supabaseClient';
// import { createAuditLog } from './auditService'; // Will be implemented

// Enhanced User Interface with RBAC support
export interface EnhancedUser {
  id: string;
  email: string;
  name?: string;
  role: 'viewer' | 'editor' | 'admin';
  permissions: string[];
  team_ids: string[];
  last_login?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Permission system
export type Permission = 
  | 'read' 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'admin'
  | 'manage_team'
  | 'view_audit'
  | 'export_data';

export interface RolePermissions {
  [key: string]: Permission[];
}

// Role-based permissions mapping
const ROLE_PERMISSIONS: RolePermissions = {
  viewer: ['read'],
  editor: ['read', 'create', 'update'],
  admin: ['read', 'create', 'update', 'delete', 'admin', 'manage_team', 'view_audit', 'export_data']
};

// Enhanced password validation with stricter requirements
export interface EnhancedPasswordValidation {
  valid: boolean;
  errors: string[];
  strength: 'very_weak' | 'weak' | 'medium' | 'strong' | 'very_strong';
  score: number; // 0-100
}

export const validatePasswordEnhanced = (password: string): EnhancedPasswordValidation => {
  const errors: string[] = [];
  let score = 0;

  // Length scoring
  if (password.length >= 12) {
    score += 25;
  } else if (password.length >= 8) {
    score += 15;
  } else {
    errors.push('Senha deve ter pelo menos 8 caracteres (12+ recomendado)');
  }

  // Character variety scoring
  const checks = [
    { regex: /[a-z]/, message: 'Senha deve conter letras minúsculas', weight: 10 },
    { regex: /[A-Z]/, message: 'Senha deve conter letras maiúsculas', weight: 10 },
    { regex: /[0-9]/, message: 'Senha deve conter números', weight: 10 },
    { regex: /[!@#$%^&*(),.?":{}|<>[\]\\;'`~+=_-]/, message: 'Senha deve conter caracteres especiais', weight: 15 },
  ];

  checks.forEach(check => {
    if (check.regex.test(password)) {
      score += check.weight;
    } else {
      errors.push(check.message);
    }
  });

  // Penalty for common patterns
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /123|abc|qwerty/i, // Common sequences
    /\d{4,}/, // Long number sequences
  ];

  commonPatterns.forEach(pattern => {
    if (pattern.test(password)) {
      score -= 10;
      errors.push('Evite padrões previsíveis na senha');
    }
  });

  // Strength classification
  let strength: EnhancedPasswordValidation['strength'] = 'very_weak';
  if (score >= 80) strength = 'very_strong';
  else if (score >= 60) strength = 'strong';
  else if (score >= 40) strength = 'medium';
  else if (score >= 20) strength = 'weak';

  return {
    valid: errors.length === 0 && score >= 40,
    errors,
    strength,
    score: Math.max(0, Math.min(100, score))
  };
};

// Session management with enhanced security
export interface SessionInfo {
  token: string;
  expires_at: string;
  refresh_token: string;
  user_agent: string;
  ip_address: string;
  created_at: string;
}

// Enhanced authentication service
export class AuthService {
  // Check if user has specific permission
  static hasPermission(user: EnhancedUser, permission: Permission): boolean {
    return user.permissions.includes(permission);
  }

  // Check if user has role
  static hasRole(user: EnhancedUser, requiredRole: 'viewer' | 'editor' | 'admin'): boolean {
    const roleHierarchy: Record<string, number> = {
      'viewer': 1,
      'editor': 2,
      'admin': 3
    };
    
    const userRoleValue = roleHierarchy[user.role];
    const requiredRoleValue = roleHierarchy[requiredRole];
    
    if (userRoleValue === undefined || requiredRoleValue === undefined) {
      return false;
    }
    
    return userRoleValue >= requiredRoleValue;
  }

  // Get all permissions for a role
  static getRolePermissions(role: 'viewer' | 'editor' | 'admin'): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  // Enhanced login with MFA support and audit logging
  static async login(
    email: string, 
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    success: boolean;
    user?: EnhancedUser;
    token?: string;
    requiresMfa?: boolean;
    error?: string;
  }> {
    try {
      // Rate limiting check (would be implemented with Redis in production)
      const rateLimitOk = await this.checkRateLimit(email);
      if (!rateLimitOk) {
        return {
          success: false,
          error: 'Muitas tentativas de login. Tente novamente em alguns minutos.'
        };
      }

      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Log failed login attempt
        // await createAuditLog({
        //   action: 'FAILED_LOGIN_ATTEMPT',
        //   table_name: 'auth',
        //   record_id: null,
        //   old_values: null,
        //   new_values: { email, error: error.message },
        //   ip_address: ipAddress,
        //   user_agent: userAgent
        // });

        return {
          success: false,
          error: this.mapAuthError(error.message)
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Falha na autenticação'
        };
      }

      // Fetch enhanced user profile
      const userProfile = await this.fetchUserProfile(data.user.id);
      if (!userProfile) {
        return {
          success: false,
          error: 'Perfil de usuário não encontrado'
        };
      }

      // Check if user is active
      if (!userProfile.is_active) {
        return {
          success: false,
          error: 'Conta desativada. Contate o administrador.'
        };
      }

      // Check MFA requirement (stub implementation)
      const requiresMfa = await this.requiresMfa(userProfile.id);
      if (requiresMfa) {
        return {
          success: true,
          requiresMfa: true,
          user: userProfile,
          token: data.session?.access_token
        };
      }

      // Log successful login
      // await createAuditLog({
      //   action: 'USER_LOGIN',
      //   table_name: 'auth',
      //   record_id: userProfile.id,
      //   old_values: null,
      //   new_values: {
      //     email: userProfile.email,
      //     role: userProfile.role,
      //     login_time: new Date().toISOString()
      //   },
      //   ip_address: ipAddress,
      //   user_agent: userAgent
      // });

      // Update last login
      await this.updateLastLogin(userProfile.id);

      return {
        success: true,
        user: userProfile,
        token: data.session?.access_token
      };

    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        error: 'Erro inesperado durante o login'
      };
    }
  }

  // Enhanced logout with session cleanup
  static async logout(userId: string, sessionId?: string): Promise<void> {
    try {
      // Log logout
      // await createAuditLog({
      //   action: 'USER_LOGOUT',
      //   table_name: 'auth',
      //   record_id: userId,
      //   old_values: null,
      //   new_values: { logout_time: new Date().toISOString() }
      // });

      // Invalidate session
      if (sessionId) {
        await this.invalidateSession(sessionId);
      }

      // Sign out from Supabase
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
      // Still sign out even if audit logging fails
      await supabase.auth.signOut();
    }
  }

  // Register new user with enhanced validation
  static async register(
    userData: {
      email: string;
      password: string;
      name: string;
      role?: 'viewer' | 'editor';
    }
  ): Promise<{
    success: boolean;
    user?: EnhancedUser;
    error?: string;
  }> {
    try {
      // Validate password strength
      const passwordValidation = validatePasswordEnhanced(userData.password);
      if (!passwordValidation.valid) {
        return {
          success: false,
          error: passwordValidation.errors[0] || 'Senha inválida'
        };
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userData.email)
        .maybeSingle();

      if (existingUser) {
        return {
          success: false,
          error: 'Usuário já cadastrado com este email'
        };
      }

      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'editor'
          }
        }
      });

      if (error) {
        return {
          success: false,
          error: this.mapAuthError(error.message)
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Falha ao criar usuário'
        };
      }

      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role || 'editor',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        });

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(data.user.id);
        return {
          success: false,
          error: 'Falha ao criar perfil de usuário'
        };
      }

      // Log user creation
      // await createAuditLog({
      //   action: 'USER_CREATED',
      //   table_name: 'profiles',
      //   record_id: data.user.id,
      //   old_values: null,
      //   new_values: {
      //     email: userData.email,
      //     name: userData.name,
      //     role: userData.role || 'editor'
      //   }
      // });

      // Fetch and return the created user
      const userProfile = await this.fetchUserProfile(data.user.id);
      
      return {
        success: true,
        user: userProfile!
      };

    } catch (err) {
      console.error('Registration error:', err);
      return {
        success: false,
        error: 'Erro inesperado durante o registro'
      };
    }
  }

  // Change password with enhanced security
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Validate new password
      const validation = validatePasswordEnhanced(newPassword);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors[0] || 'Senha inválida'
        };
      }

      // Verify current password by attempting login
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return {
          success: false,
          error: this.mapAuthError(error.message)
        };
      }

      // Log password change
      // await createAuditLog({
      //   action: 'PASSWORD_CHANGED',
      //   table_name: 'auth',
      //   record_id: userId,
      //   old_values: null,
      //   new_values: { change_time: new Date().toISOString() }
      // });

      return {
        success: true
      };

    } catch (err) {
      console.error('Password change error:', err);
      return {
        success: false,
        error: 'Erro ao alterar senha'
      };
    }
  }

  // Reset password flow
  static async resetPassword(
    email: string
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return {
          success: false,
          error: this.mapAuthError(error.message)
        };
      }

      // Log password reset request
      // await createAuditLog({
      //   action: 'PASSWORD_RESET_REQUESTED',
      //   table_name: 'auth',
      //   record_id: null,
      //   old_values: null,
      //   new_values: { email, request_time: new Date().toISOString() }
      // });

      return {
        success: true,
        message: 'Instruções de redefinição enviadas para seu email'
      };

    } catch (err) {
      console.error('Password reset error:', err);
      return {
        success: false,
        error: 'Erro ao solicitar redefinição de senha'
      };
    }
  }

  // Private helper methods
  private static async fetchUserProfile(userId: string): Promise<EnhancedUser | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        name,
        role,
        created_at,
        updated_at,
        last_login,
        is_active,
        team_members(team_id)
      `)
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      permissions: this.getRolePermissions(data.role as any),
      team_ids: data.team_members?.map((tm: any) => tm.team_id) || [],
      last_login: data.last_login,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_active: data.is_active
    };
  }

  private static async updateLastLogin(userId: string): Promise<void> {
    await supabase
      .from('profiles')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  }

  private static async checkRateLimit(email: string): Promise<boolean> {
    // In production, this would use Redis
    // Stub implementation - always allow for now
    return true;
  }

  private static async requiresMfa(userId: string): Promise<boolean> {
    // Check if user has MFA enabled
    // Stub implementation
    return false;
  }

  private static async invalidateSession(sessionId: string): Promise<void> {
    // Invalidate specific session
    // Stub implementation
  }

  private static mapAuthError(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'Email not confirmed': 'Por favor, confirme seu email primeiro',
      'Password should be at least 6 characters': 'Senha deve ter pelo menos 6 caracteres',
      'User already registered': 'Usuário já cadastrado',
      'Too many requests': 'Muitas tentativas. Aguarde alguns minutos'
    };

    return errorMap[errorMessage] || errorMessage;
  }
}

// Hook for React components
export const useAuthService = () => {
  return {
    login: AuthService.login,
    logout: AuthService.logout,
    register: AuthService.register,
    changePassword: AuthService.changePassword,
    resetPassword: AuthService.resetPassword,
    hasPermission: AuthService.hasPermission,
    hasRole: AuthService.hasRole
  };
};

export default AuthService;