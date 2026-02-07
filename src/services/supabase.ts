import { createClient, SupabaseClient } from '@supabase/supabase-js';

// =============================================================================
// Environment Variable Validation
// =============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Validates required environment variables exist */
function validateEnvVars(): { url: string; key: string } {
    const missingVars: string[] = [];
    
    if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
    
    if (missingVars.length > 0) {
        const errorMsg = `[CRITICAL] Missing required environment variables: ${missingVars.join(', ')}. Application may not function correctly.`;
        console.error(errorMsg);
        
        // In production, this would cause a clear error rather than silent failure
        if (import.meta.env.PROD) {
            throw new Error(errorMsg);
        }
    }
    
    return {
        url: supabaseUrl || '',
        key: supabaseAnonKey || ''
    };
}

const { url, key } = validateEnvVars();

export const supabase: SupabaseClient = createClient(url, key);

// =============================================================================
// Session Validation Helper
// =============================================================================

export interface SessionValidationResult {
    isValid: boolean;
    userId: string | null;
    error?: string;
}

/**
 * Validates that the current user has an active session
 * Returns user ID if valid, error message if not
 */
export async function validateSession(): Promise<SessionValidationResult> {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            return {
                isValid: false,
                userId: null,
                error: `Session validation failed: ${error.message}`
            };
        }
        
        if (!session?.user?.id) {
            return {
                isValid: false,
                userId: null,
                error: 'No active session found'
            };
        }
        
        return {
            isValid: true,
            userId: session.user.id
        };
    } catch (err) {
        return {
            isValid: false,
            userId: null,
            error: err instanceof Error ? err.message : 'Unknown session error'
        };
    }
}

/**
 * Gets the current user ID or throws if not authenticated
 */
export async function requireAuth(): Promise<string> {
    const result = await validateSession();
    
    if (!result.isValid || !result.userId) {
        throw new Error(result.error || 'Authentication required');
    }
    
    return result.userId;
}
