import { useState, useEffect, useCallback } from 'react';
import { AuthUser, Profile, supabase } from '../services/supabaseClient';
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
    let isMounted = true;
    
    // Diagnostic logging
    console.log('🔄 Auth useEffect triggered - mounting component');
    console.log('Initial auth state:', { 
      isAuthenticated: authState.isAuthenticated, 
      isLoading: authState.isLoading 
    });
    
    const initializeAuth = async () => {
      try {
        console.log('🔍 Starting authentication initialization...');
        
        // Force loading state immediately and ensure minimum loading time
        if (!authState.isLoading) {
          console.log('🔧 Setting loading state to true');
          setAuthState(prev => ({ ...prev, isLoading: true }));
        }
        
        
        
        // 1. Verifica sessão no Supabase (cookies httpOnly)
        console.log('📡 Checking Supabase session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Check if session is expired
        const isExpired = session?.expires_at 
          ? new Date(session.expires_at * 1000) < new Date()
          : false;
        
        if (isExpired) {
          console.log('⏰ Session expired, signing out...');
          await supabase.auth.signOut();
          setAuthState({
            user: null,
            profile: null,
            role: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            needsPasswordChange: false,
          });
          localStorage.clear();
          return;
        }
        
        if (!isMounted) {
          console.log('🚫 Component unmounted during session check');
          return;
        }
        
        console.log('📊 Session check result:', { 
          hasSession: !!session?.user, 
          hasError: !!error,
          userId: session?.user?.id || 'none'
        });
        
        // 2. Se não tem sessão válida = deslogado
        if (error || !session?.user) {
          console.log('❌ No valid session found, setting unauthenticated state');
          setAuthState({
            user: null,
            profile: null,
            role: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            needsPasswordChange: false,
          });
          localStorage.removeItem('isAuthenticated'); // Limpa localStorage desatualizado
          console.log('✅ Authentication state set to unauthenticated');
          return;
        }
        
        // 3. Busca perfil APENAS se sessão existe
        console.log('👤 Fetching user profile...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (!isMounted) {
          console.log('🚫 Component unmounted during profile fetch');
          return;
        }
        
        console.log('📊 Profile fetch result:', { 
          hasProfile: !!profileData, 
          hasError: !!profileError,
          profileId: profileData?.id || 'none'
        });
        
        // 4. Se perfil não existe = logout (sessão órfã)
        if (profileError || !profileData) {
          console.log('❌ Profile not found, forcing logout');
          await supabase.auth.signOut();
          setAuthState({
            user: null,
            profile: null,
            role: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Perfil não encontrado',
            needsPasswordChange: false,
          });
          localStorage.clear();
          console.log('✅ Authentication state set to unauthenticated after profile failure');
          return;
        }
        
        // 5. Tudo OK = autentica
        console.log('✅ All validation passed, setting authenticated state');
        setAuthState({
          user: session.user,
          profile: profileData,
          role: profileData.role,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          needsPasswordChange: profileData.first_login === true,
        });
        localStorage.setItem('isAuthenticated', 'true');
        console.log('🎉 Authentication completed successfully');
        
      } catch (err) {
        if (!isMounted) {
          console.log('🚫 Component unmounted during error handling');
          return;
        }
        console.error('💥 Auth initialization error:', err);
        setAuthState({
          user: null,
          profile: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Erro ao carregar sessão',
          needsPasswordChange: false,
        });
        localStorage.clear();
        console.log('✅ Authentication state set to unauthenticated after error');
      }
    };
    
    initializeAuth();
    
    // Listener para mudanças de sessão (logout em outra aba)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (!isMounted) return;
        
        if (event === 'SIGNED_OUT' || !session) {
          setAuthState({
            user: null,
            profile: null,
            role: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            needsPasswordChange: false,
          });
          localStorage.clear();
          sessionStorage.clear();
        } else if (event === 'SIGNED_IN' && session) {
          // Re-fetch profile após login
          initializeAuth();
        }
      }
    );
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
