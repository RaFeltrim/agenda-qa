import React, { useState, useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500 dark:text-red-400" />
          </div>
          
          {/* Error Title */}
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h2>
          
          {/* Error Description */}
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            We've been notified and are working on fixing this issue.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-4 mb-6 text-left">
              <details className="text-xs">
                <summary className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer mb-2">
                  Technical Details
                </summary>
                <div className="text-slate-600 dark:text-slate-400 font-mono">
                  <p className="mb-2"><strong>Message:</strong> {error.message}</p>
                  <pre className="whitespace-pre-wrap overflow-x-auto text-xs">
                    {error.stack}
                  </pre>
                </div>
              </details>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={resetError}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            
            <button
              onClick={handleGoHome}
              className="flex-1 py-3 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </div>

          {/* Contact Support */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Need help? Contact technical support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (hasError && error) {
      console.error('Application error caught:', error);
      // TODO: Integrate with Sentry/Error reporting service
    }
  }, [hasError, error]);

  const resetError = () => {
    setHasError(false);
    setError(null);
  };

  if (hasError && error) {
    return <ErrorFallback error={error} resetError={resetError} />;
  }

  return <>{children}</>;
};

export default ErrorBoundary;