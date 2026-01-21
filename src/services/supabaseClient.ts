import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallbacks
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Validate configuration - be more lenient to allow real auth
const isValidConfig = supabaseUrl && supabaseAnonKey && supabaseUrl.trim().length > 0;

// Log configuration status for debugging
if (typeof window !== 'undefined') {
  console.log('🔍 Supabase Config Status:', {
    urlPresent: !!supabaseUrl,
    keyPresent: !!supabaseAnonKey,
    urlValid: supabaseUrl?.startsWith('http'),
    finalDecision: isValidConfig
  });
}

// Console warnings for debugging
if (!isValidConfig) {
  console.warn('⚠️ Supabase configuration incomplete:');
  console.warn('  VITE_SUPABASE_URL:', supabaseUrl || 'MISSING');
  console.warn('  VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'PRESENT' : 'MISSING');

  if (typeof window !== 'undefined') {
    console.info('ℹ️ Running in demo mode - authentication will be simulated');
  }
} else {
  console.log('✅ Using real Supabase authentication');
}

// Create the Supabase client (real or mock based on config)
export const supabase = isValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  : {
    // Mock client for development/offline mode
    auth: {
      signInWithPassword: async () => {
        if (typeof window === 'undefined') {
          throw new Error('Supabase not configured');
        }
        // Demo login credentials
        return {
          data: {
            user: {
              id: 'demo-user',
              email: 'demo@example.com',
              user_metadata: {
                full_name: 'Demo User',
                username: 'demo'
              }
            },
            session: {
              user: {
                id: 'demo-user',
                email: 'demo@example.com',
                user_metadata: {
                  full_name: 'Demo User',
                  username: 'demo'
                }
              },
              access_token: 'mock-token',
              expires_at: Math.floor(Date.now() / 1000) + 3600
            }
          },
          error: null
        };
      },
      signOut: async () => ({ error: null }),
      getUser: async () => ({
        data: {
          user: {
            id: 'demo-user',
            email: 'demo@example.com',
            user_metadata: {
              full_name: 'Demo User',
              username: 'demo'
            }
          }
        },
        error: null
      }),
      updateUser: async () => ({ error: null }),
      getSession: async () => ({
        data: {
          session: {
            user: {
              id: 'demo-user',
              email: 'demo@example.com',
              user_metadata: {
                full_name: 'Demo User',
                username: 'demo'
              }
            },
            access_token: 'mock-token',
            expires_at: Math.floor(Date.now() / 1000) + 3600
          }
        },
        error: null
      }),
      onAuthStateChange: (callback: any) => {
        // Immediately simulate SIGNE_IN for demo purposes if we want auto-login, 
        // OR do nothing to simulate logged out state initially.
        // Let's return a dummy subscription.
        return {
          data: {
            subscription: {
              unsubscribe: () => { }
            }
          }
        };
      }
    },
    from: (table: string) => {
      // Shared logic for profile data
      const profileData = {
        id: 'demo-user',
        username: 'demo',
        full_name: 'Demo User',
        role: 'editor',
        first_login: false,
        password_changed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const builder: any = {
        select: () => builder,
        eq: () => builder,
        order: () => builder,
        single: () => Promise.resolve({
          data: table === 'profiles' ? profileData : null,
          error: null
        }),
        update: () => builder,
        // If awaited directly (for list results)
        then: (resolve: any, reject: any) => {
          const result = {
            data: table === 'profiles' ? [profileData] : [],
            error: null
          };
          return Promise.resolve(result).then(resolve, reject);
        }
      };
      return builder;
    },
    channel: (name: string) => ({
      on: () => ({
        subscribe: () => { }
      })
    }),
    removeChannel: () => { },
  } as any;

// Types for our profiles table
export interface Profile {
  id: string;
  username: string;
  full_name: string;
  role: 'editor' | 'viewer';
  first_login: boolean;
  password_changed_at: string | null;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  bio?: string;
  email?: string;
}

// Types for authentication
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata: {
    full_name?: string;
    username?: string;
  };
}

export interface AuthResponse {
  user: AuthUser | null;
  profile: Profile | null;
  role: 'editor' | 'viewer' | null;
  error: string | null;
}