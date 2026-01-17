import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Session expires in 1 hour
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});

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
