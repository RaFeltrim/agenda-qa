import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

type UserRole = 'admin' | 'user' | 'viewer';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Ensure a profile row exists for the given user.
 * If no profile exists, upsert one with a default role:
 * - 'admin' if this is the first profile in the system
 * - 'viewer' otherwise
 */
async function ensureProfile(user: User): Promise<UserRole> {
  try {
    // Try to fetch existing profile
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (data?.role) {
      return (data.role as UserRole) || 'viewer';
    }

    // Profile doesn't exist or table just created — upsert a new one
    if (error) {
      console.info('[Auth] Profile not found, creating one for', user.email);

      // Determine role: first user → admin, rest → viewer
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      const defaultRole: UserRole = (count === 0 || count === null) ? 'admin' : 'viewer';

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          username: user.email?.split('@')[0] || user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          role: defaultRole,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (upsertError) {
        console.warn('[Auth] Failed to upsert profile:', upsertError.message);
        return 'viewer';
      }

      console.info('[Auth] Profile created with role:', defaultRole);
      return defaultRole;
    }

    return 'viewer';
  } catch (err) {
    console.error('[Auth] Error in ensureProfile:', err);
    return 'viewer';
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('viewer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      // Cypress E2E: the Supabase SDK's fetch() hangs in Cypress headless.
      // When running under Cypress, read session from localStorage directly
      // to bypass all network calls.
      // BUG-009 FIX: Only allow bypass in development mode to prevent production auth bypass
      if (import.meta.env.DEV && typeof window !== 'undefined' && (window as any).Cypress) {
        try {
          // BUG-010 FIX: Derive storage key from Supabase URL instead of hardcoding
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
          const projectRef = supabaseUrl.match(/\/\/([^.]+)\./)?.[1] || '';
          const storageKey = projectRef ? `sb-${projectRef}-auth-token` : '';
          const raw = storageKey ? localStorage.getItem(storageKey) : null;
          if (raw) {
            const sessionData = JSON.parse(raw);
            if (sessionData?.user) {
              setUser(sessionData.user as User);
              // BUG-011 FIX: Read role from session data or ensureProfile instead of hardcoding 'viewer'
              const userRole = sessionData.user?.user_metadata?.role || sessionData.role || 'viewer';
              setRole(userRole as UserRole);
              setLoading(false);
              return;
            }
          }
        } catch (error) {
          // Fall through to normal flow
          console.warn('[Auth] Cypress localStorage read failed:', error);
        }
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        if (!mounted) return;
        setUser(currentUser);
        if (currentUser) {
          try {
            const userRole = await ensureProfile(currentUser);
            if (mounted) setRole(userRole);
          } catch (err) {
            console.warn('[Auth] ensureProfile failed during getSession:', err);
          }
        }
      } catch (err) {
        console.error('[Auth] getSession failed:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // Skip in Cypress — session is managed via localStorage injection (DEV only)
        if (import.meta.env.DEV && typeof window !== 'undefined' && (window as any).Cypress) return;
        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          try {
            const userRole = await ensureProfile(currentUser);
            if (mounted) setRole(userRole);
          } catch (err) {
            console.warn('[Auth] ensureProfile failed during auth change:', err);
            // Don't block — keep existing role
          }
        } else {
          setRole('viewer');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'user' } },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setRole('viewer');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, role, login, signup, logout, resetPassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
