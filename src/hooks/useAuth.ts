import { useAuthContext } from '../contexts/AuthContext';

/**
 * useAuth Hook
 * Now a simple wrapper around the centralized AuthContext.
 * This ensures all components use the exact same authentication state
 * and eliminates race conditions.
 */
export const useAuth = () => {
  return useAuthContext();
};

