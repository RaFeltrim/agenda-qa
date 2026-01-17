import { useState, useEffect, useCallback } from 'react';
import { AuthUser, Profile } from '../services/supabaseClient';
import {
  signIn,
  logout,
  getCurrentUser,
  changePassword,
  needsPasswordChange,
} from '../services/authService';

interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  role: 'editor' | 'viewer' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  needsPasswordChange: boolean;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  needsPasswordChange: false,
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  // Load user session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await getCurrentUser();

        if (response.user) {
          setAuthState({
            user: response.user,
            profile: response.profile,
            role: response.role,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            needsPasswordChange: needsPasswordChange(response.profile),
          });
        } else {
          setAuthState({
            ...initialState,
            isLoading: false,
            error: response.error || null,
          });
        }
      } catch (err) {
        setAuthState({
          ...initialState,
          isLoading: false,
          error: 'Erro ao carregar sessão',
        });
      }
    };

    loadSession();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await signIn(username, password);

      if (response.error) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error,
        }));
        return false;
      }

      if (response.user) {
        setAuthState({
          user: response.user,
          profile: response.profile,
          role: response.role,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          needsPasswordChange: needsPasswordChange(response.profile),
        });
        return true;
      }

      return false;
    } catch (err) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro inesperado durante o login',
      }));
      return false;
    }
  }, []);

  const changeUserPassword = useCallback(async (newPassword: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await changePassword(newPassword);

      if (response.success) {
        // Update local state to reflect password change
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          needsPasswordChange: false,
          profile: prev.profile ? { ...prev.profile, first_login: false } : null,
        }));
        return { success: true, error: null };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error,
        }));
        return { success: false, error: response.error };
      }
    } catch (err) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro inesperado ao alterar senha',
      }));
      return { success: false, error: 'Erro inesperado ao alterar senha' };
    }
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await logout();
      setAuthState(initialState);
    } catch (err) {
      // Even if logout fails, clear local state
      setAuthState(initialState);
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    ...authState,

    // Actions
    login,
    logout: logoutUser,
    changePassword: changeUserPassword,
    clearError,

    // Helpers
    isAdmin: authState.role === 'editor',
    isViewer: authState.role === 'viewer',
  };
};
