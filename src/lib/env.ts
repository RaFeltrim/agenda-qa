/**
 * Environment Variable Validation Module
 * 
 * Validates all required environment variables exist at application startup.
 * Prevents the app from running with missing or malformed configurations.
 */

// =============================================================================
// Type Definitions
// =============================================================================

interface EnvConfig {
    /** Supabase project URL */
    SUPABASE_URL: string;
    /** Supabase anonymous public key */
    SUPABASE_ANON_KEY: string;
    /** Google Gemini API key (optional - for AI features) */
    GEMINI_API_KEY: string | null;
    /** Mock auth for development */
    USE_MOCK_AUTH: boolean;
    /** Current environment */
    NODE_ENV: 'development' | 'production' | 'test';
    /** Is production environment */
    IS_PRODUCTION: boolean;
}

interface ValidationResult {
    isValid: boolean;
    missingVars: string[];
    warnings: string[];
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validates that a URL string is properly formatted
 */
function isValidUrl(urlString: string): boolean {
    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Validates that a key looks like a valid Supabase key (basic format check)
 */
function isValidSupabaseKey(key: string): boolean {
    // Supabase keys are base64-encoded JWT-like strings
    // They should be relatively long and contain only base64 + common JWT chars
    return key.length > 30 && /^[A-Za-z0-9_-]+\.?[A-Za-z0-9_-]*\.?[A-Za-z0-9_-]*$/.test(key);
}

/**
 * Validates all required environment variables
 */
function validateEnvironment(): ValidationResult {
    const missingVars: string[] = [];
    const warnings: string[] = [];

    // Required: Supabase URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
        missingVars.push('VITE_SUPABASE_URL');
    } else if (!isValidUrl(supabaseUrl)) {
        missingVars.push('VITE_SUPABASE_URL (invalid URL format)');
    }

    // Required: Supabase Anon Key
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseKey) {
        missingVars.push('VITE_SUPABASE_ANON_KEY');
    } else if (!isValidSupabaseKey(supabaseKey)) {
        warnings.push('VITE_SUPABASE_ANON_KEY appears malformed - verify key format');
    }

    // Optional: Gemini API Key (warn if missing for AI features)
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!geminiKey) {
        warnings.push('VITE_GEMINI_API_KEY is not set - AI features will be disabled');
    }

    return {
        isValid: missingVars.length === 0,
        missingVars,
        warnings
    };
}

// =============================================================================
// Initialization and Export
// =============================================================================

/**
 * Run environment validation at module load time
 * This ensures the app fails fast if configuration is missing
 */
function initializeEnv(): EnvConfig {
    const validation = validateEnvironment();

    // Log warnings (non-blocking)
    validation.warnings.forEach(warning => {
        console.warn(`[ENV] ⚠️ ${warning}`);
    });

    // In production, throw error for missing required vars
    if (!validation.isValid) {
        const errorMsg = `[ENV] ❌ Missing required environment variables:\n${validation.missingVars.map(v => `  - ${v}`).join('\n')}`;
        console.error(errorMsg);

        if (import.meta.env.PROD) {
            throw new Error(errorMsg);
        }
    }

    return {
        SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
        SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || null,
        USE_MOCK_AUTH: import.meta.env.VITE_USE_MOCK_AUTH === 'true',
        NODE_ENV: import.meta.env.MODE as EnvConfig['NODE_ENV'],
        IS_PRODUCTION: import.meta.env.PROD
    };
}

/**
 * Validated environment configuration
 * Access this to get type-safe environment variables
 */
export const env = initializeEnv();

/**
 * Re-run validation (useful for testing)
 */
export function revalidateEnv(): ValidationResult {
    return validateEnvironment();
}

/**
 * Check if all required services are configured
 */
export function isFullyConfigured(): boolean {
    return !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
}

/**
 * Check if AI features are available
 */
export function isAIEnabled(): boolean {
    return !!env.GEMINI_API_KEY;
}

export default env;
