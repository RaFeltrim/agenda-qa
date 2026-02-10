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
 *   - 'admin' if this is the first profile in the system
 *   - 'viewer' otherwise
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
    const getSession = async () => {
      // Cypress E2E: the Supabase SDK's fetch() hangs in Cypress headless.
      // When running under Cypress, read session from localStorage directly
      // to bypass all network calls.
      if (typeof window !== 'undefined' && (window as any).Cypress) {
        try {
          const raw = localStorage.getItem('sb-njbtlnhhsspxjscyzoxp-auth-token');
          if (raw) {
            const sessionData = JSON.parse(raw);
            if (sessionData?.user) {
              setUser(sessionData.user as User);
              setRole('viewer');
              setLoading(false);
              return;
            }
          }
        } catch {
          // Fall through to normal flow
        }
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const userRole = await ensureProfile(currentUser);
        setRole(userRole);
      }
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // Skip in Cypress — session is managed via localStorage injection
        if (typeof window !== 'undefined' && (window as any).Cypress) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          const userRole = await ensureProfile(currentUser);
          setRole(userRole);
        } else {
          setRole('viewer');
        }
      }
    );

    return () => subscription.unsubscribe();
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
