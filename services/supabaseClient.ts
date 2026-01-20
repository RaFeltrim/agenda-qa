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
      },
      from: (table: string) => ({
        select: () => ({
          eq: () => Promise.resolve({ 
            data: table === 'profiles' ? [{ 
              id: 'demo-user', 
              username: 'demo', 
              full_name: 'Demo User',
              role: 'editor',
              first_login: false,
              password_changed_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }] : [],
            error: null 
          }),
          single: () => Promise.resolve({ 
            data: table === 'profiles' ? { 
              id: 'demo-user', 
              username: 'demo', 
              full_name: 'Demo User',
              role: 'editor',
              first_login: false,
              password_changed_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } : null,
            error: null 
          })
        }),
        update: () => ({
          eq: () => Promise.resolve({ error: null })
        }),
      }),
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