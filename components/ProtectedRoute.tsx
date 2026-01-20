import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Login from './Login';
import FirstPasswordChange from './FirstPasswordChange';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'editor' | 'viewer';
  addNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, addNotification }) => {
  const { isAuthenticated, isLoading, role, needsPasswordChange } = useAuth();

<<<<<<< HEAD
  // Debug authentication state
=======
<<<<<<< Updated upstream
  // TEMPORARY: Disable login screen - bypass authentication
  const bypassAuth = true;
  const tempIsAuthenticated = bypassAuth ? true : isAuthenticated;
  const tempRole = bypassAuth ? 'editor' : role;
=======
  // Track authentication state changes
>>>>>>> dev
  useEffect(() => {
    console.log('Auth State Changed:', { isAuthenticated, isLoading, role, needsPasswordChange });
  }, [isAuthenticated, isLoading, role, needsPasswordChange]);

<<<<<<< HEAD
  // Force component update when auth state changes
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('Triggering force update for authenticated state');
      forceUpdate();
    }
  }, [isAuthenticated, isLoading]);

  // Use actual authentication state
  const tempIsAuthenticated = isAuthenticated;
  const tempRole = role;
=======
  // Use actual authentication state
  const tempIsAuthenticated = isAuthenticated;
  const tempRole = role;
>>>>>>> Stashed changes

  // Failsafe: Only redirect to login if we're on a protected route and not authenticated
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    if (!isAuthenticated && !isLoading && currentPath !== '/login') {
      // Only redirect if we're not already on the login page
      const timer = setTimeout(() => {
        if (!isAuthenticated && !isLoading && window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading]);
>>>>>>> dev

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Carregando...</p>
        </motion.div>
      </div>
    );
  }

<<<<<<< HEAD
  // Force re-render when auth state changes
  const authKey = `${tempIsAuthenticated}-${isLoading}-${needsPasswordChange}-${tempRole}`;

=======
<<<<<<< Updated upstream
=======


>>>>>>> Stashed changes
>>>>>>> dev
  return (
    <AnimatePresence mode="wait" key={authKey}>
      {tempIsAuthenticated ? (
        needsPasswordChange ? (
          <motion.div
            key="password-change"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <FirstPasswordChange />
          </motion.div>
        ) : requiredRole && tempRole !== requiredRole ? (
          <motion.div
            key="access-denied"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-slate-900 flex items-center justify-center p-4"
          >
            <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 text-center">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white mb-4">Acesso Negado</h2>
              <p className="text-slate-400 mb-6">
                Você não tem permissão para acessar esta área.
                <br />
                Entre em contato com o administrador do sistema.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-colors"
              >
                Voltar
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        )
      ) : (
        <motion.div
          key="login"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <Login 
            onLoginSuccess={() => {
              // Login success handled by auth state change
              console.log('Login successful, waiting for auth state update');
            }}
            addNotification={addNotification || (() => {})}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProtectedRoute;
