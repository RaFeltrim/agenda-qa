/**
 * Supabase Client Configuration
 * 
 * Centralized Supabase client instance with environment validation.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

// =============================================================================
// Client Initialization
// =============================================================================

/**
 * Supabase client instance
 * Uses validated environment variables from env.ts
 */
export const supabase: SupabaseClient = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
  {
        auth: {
                persistSession: true,
                autoRefreshToken: true,
        }
  }
  );

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get current authenticated user ID
 * @throws Error if user is not authenticated
 */
export async function getCurrentUserId(): Promise<string> {
    const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
        throw new Error('User not authenticated');
  }

  return user.id;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
}

export default supabase;
