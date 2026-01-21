import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { AuthUser, Profile, supabase } from '../services/supabaseClient';
import {
    signIn,
    logout as authLogout,
    changePassword as authChangePassword,
    needsPasswordChange as checkNeedsPasswordChange,
} from '../services/authService';

// Define the shape of the context state
interface AuthState {
    user: AuthUser | null;
    profile: Profile | null;
    role: 'editor' | 'viewer' | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    needsPasswordChange: boolean;
}

// Define the context value (State + Actions)
interface AuthContextType extends AuthState {
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    changePassword: (newPassword: string) => Promise<{ success: boolean; error: string | null }>;
    clearError: () => void;
    isAdmin: boolean;
    isViewer: boolean;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>(initialState);

    // Initialize Auth Logic (Moved from useAuth hook)
    useEffect(() => {
        let isMounted = true;

        console.log('🔄 AuthProvider triggered - mounting');

        const initializeAuth = async () => {
            try {
                if (!authState.isLoading) {
                    setAuthState(prev => ({ ...prev, isLoading: true }));
                }

                // 1. Check Session
                const { data: { session }, error } = await supabase.auth.getSession();

                const isExpired = session?.expires_at
                    ? new Date(session.expires_at * 1000) < new Date()
                    : false;

                if (isExpired) {
                    console.log('⏰ Session expired, signing out...');
                    await supabase.auth.signOut();
                    if (isMounted) {
                        setAuthState({ ...initialState, isLoading: false });
                        localStorage.clear();
                    }
                    return;
                }

                if (error || !session?.user) {
                    console.log('❌ No valid session found');
                    if (isMounted) {
                        setAuthState({ ...initialState, isLoading: false });
                        localStorage.removeItem('isAuthenticated');
                    }
                    return;
                }

                // 2. Fetch Profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profileError || !profileData) {
                    console.log('❌ Profile not found, forcing logout');
                    await supabase.auth.signOut();
                    if (isMounted) {
                        setAuthState({
                            ...initialState,
                            isLoading: false,
                            error: 'Perfil não encontrado',
                        });
                        localStorage.clear();
                    }
                    return;
                }

                // 3. Success
                if (isMounted) {
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
                }

            } catch (err) {
                console.error('💥 Auth initialization error:', err);
                if (isMounted) {
                    setAuthState({
                        ...initialState,
                        isLoading: false,
                        error: 'Erro ao carregar sessão',
                    });
                    localStorage.clear();
                }
            }
        };

        initializeAuth();

        // Auth State Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;

                if (event === 'SIGNED_OUT' || !session) {
                    setAuthState({ ...initialState, isLoading: false });
                    localStorage.clear();
                    sessionStorage.clear();
                } else if (event === 'SIGNED_IN' && session) {
                    // Re-trigger initialization to get profile
                    initializeAuth();
                }
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Actions
    const login = useCallback(async (username: string, password: string) => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
            const response = await signIn(username, password);

            if (response.error) {
                setAuthState(prev => ({ ...prev, isLoading: false, error: response.error }));
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
                    needsPasswordChange: checkNeedsPasswordChange(response.profile),
                });
                return true;
            }
            return false;
        } catch (err) {
            setAuthState(prev => ({ ...prev, isLoading: false, error: 'Erro inesperado durante o login' }));
            return false;
        }
    }, []);

    const changePassword = useCallback(async (newPassword: string) => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
            const response = await authChangePassword(newPassword);

            if (response.success) {
                setAuthState(prev => ({
                    ...prev,
                    isLoading: false,
                    needsPasswordChange: false,
                    profile: prev.profile ? { ...prev.profile, first_login: false } : null,
                }));
                return { success: true, error: null };
            } else {
                setAuthState(prev => ({ ...prev, isLoading: false, error: response.error }));
                return { success: false, error: response.error };
            }
        } catch (err) {
            setAuthState(prev => ({ ...prev, isLoading: false, error: 'Erro inesperado ao alterar senha' }));
            return { success: false, error: 'Erro inesperado ao alterar senha' };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authLogout();
            setAuthState(initialState);
        } catch (err) {
            setAuthState(initialState);
        }
    }, []);

    const clearError = useCallback(() => {
        setAuthState(prev => ({ ...prev, error: null }));
    }, []);

    const value: AuthContextType = {
        ...authState,
        login,
        logout,
        changePassword,
        clearError,
        isAdmin: authState.role === 'editor',
        isViewer: authState.role === 'viewer',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to consume the context
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
