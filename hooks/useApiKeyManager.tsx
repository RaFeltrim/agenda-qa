import React, { useState, useEffect, useCallback } from 'react';

interface ApiKeyState {
  isValid: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
}

const STORAGE_KEY = 'gemini_api_key_status';
const CHECK_INTERVAL = 5000; // 5 seconds

export const useApiKeyManager = () => {
  const [apiKeyState, setApiKeyState] = useState<ApiKeyState>({
    isValid: false,
    isChecking: false,
    lastChecked: null,
    error: null,
  });

  // Load initial state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setApiKeyState({
          ...parsed,
          lastChecked: parsed.lastChecked ? new Date(parsed.lastChecked) : null,
        });
      } catch (e) {
        console.warn('Failed to parse saved API key state');
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...apiKeyState,
        lastChecked: apiKeyState.lastChecked?.toISOString(),
      })
    );
  }, [apiKeyState]);

  // Check if API key is valid
  const checkApiKeyValidity = useCallback(async (): Promise<boolean> => {
    setApiKeyState(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      // Check if API key exists in environment
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

      if (!apiKey || apiKey === 'your_gemini_api_key') {
        setApiKeyState({
          isValid: false,
          isChecking: false,
          lastChecked: new Date(),
          error: 'API key not configured',
        });
        return false;
      }

      // Test API key with a simple request
      const testResponse = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
        }
      );

      const isValid = testResponse.status !== 403 && testResponse.status !== 401;

      setApiKeyState({
        isValid,
        isChecking: false,
        lastChecked: new Date(),
        error: isValid ? null : 'Invalid or expired API key',
      });

      return isValid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiKeyState({
        isValid: false,
        isChecking: false,
        lastChecked: new Date(),
        error: `Connection error: ${errorMessage}`,
      });
      return false;
    }
  }, []);

  // Auto-check API key periodically
  useEffect(() => {
    // Check immediately on mount
    checkApiKeyValidity();

    // Set up periodic checking
    const interval = setInterval(() => {
      checkApiKeyValidity();
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [checkApiKeyValidity]);

  // Manual trigger for checking API key
  const manuallyCheckApiKey = useCallback(async () => {
    return await checkApiKeyValidity();
  }, [checkApiKeyValidity]);

  // Reset API key state (useful for testing)
  const resetApiKeyState = useCallback(() => {
    setApiKeyState({
      isValid: false,
      isChecking: false,
      lastChecked: null,
      error: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    ...apiKeyState,
    checkApiKeyValidity: manuallyCheckApiKey,
    resetApiKeyState,
  };
};

// Higher-order component for disabling/enabling features based on API key status
export const withApiKeyProtection = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  featureName: string
) => {
  return (props: P) => {
    const { isValid, isChecking } = useApiKeyManager();

    if (isChecking) {
      return (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-slate-500">Verificando {featureName}...</p>
        </div>
      );
    }

    if (!isValid) {
      return (
        <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 text-center">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Funcionalidade Desativada</h3>
          <p className="text-slate-400 mb-4">
            A funcionalidade <span className="font-bold text-amber-400">{featureName}</span> está
            desativada porque a chave de API não foi configurada ou é inválida.
          </p>
          <div className="text-xs text-slate-500">
            Configure sua chave de API Gemini no arquivo .env para habilitar esta funcionalidade.
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

// Context for API key state (optional, for complex applications)
export const ApiKeyContext = React.createContext<{
  state: ApiKeyState;
  checkApiKey: () => Promise<boolean>;
  resetState: () => void;
} | null>(null);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiKeyManager = useApiKeyManager();

  return (
    <ApiKeyContext.Provider
      value={{
        state: apiKeyManager,
        checkApiKey: apiKeyManager.checkApiKeyValidity,
        resetState: apiKeyManager.resetApiKeyState,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
};
