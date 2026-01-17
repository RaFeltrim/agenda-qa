import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Lock, User, LogIn, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';
import { PageTransition, SmoothSpinner } from './Transitions';

interface LoginProps {
  onLoginSuccess?: () => void;
  addNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, addNotification }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();

  // Clear error when user starts typing
  useEffect(() => {
    if (error) clearError();
  }, [username, password, error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      addNotification?.('Por favor, preencha todos os campos', 'warning');
      return;
    }

    try {
      const success = await login(username.trim(), password);
      
      if (success) {
        addNotification?.(`Bem-vindo, ${username.trim()}!`, 'success');
        onLoginSuccess?.();
      } else {
        // Error is handled by the auth hook, but we can add additional context
        addNotification?.('Falha na autenticação. Verifique suas credenciais.', 'error');
      }
    } catch (err) {
      addNotification?.('Erro inesperado durante o login. Tente novamente.', 'error');
    }
  };

  const handleUsernameBlur = () => {
    if (username.trim() && !password.trim()) {
      addNotification?.('Por favor, informe sua senha', 'info');
    }
  };

  const handlePasswordBlur = () => {
    if (password.trim() && !username.trim()) {
      addNotification?.('Por favor, informe seu usuário', 'info');
    }
  };

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.2,
            }}
            className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl mx-auto mb-6"
          >
            <Lock className="w-10 h-10" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-4xl font-black text-white mb-2 uppercase tracking-tighter"
          >
            Agenda QA
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="text-slate-400 font-medium"
          >
            Sistema de Gerenciamento Kanban
          </motion.p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-slate-300 mb-2">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onBlur={handleUsernameBlur}
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all touch-target"
                  placeholder="Digite seu usuário"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={handlePasswordBlur}
                  className="w-full pl-12 pr-12 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all touch-target"
                  placeholder="Digite sua senha"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-500 hover:text-slate-300 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Inline Error Message (still shown for immediate feedback) */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-red-900/30 border border-red-800/50 p-4"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mr-3" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl bg-indigo-900/30 border border-indigo-800/50 p-4"
              >
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-400 mr-3"></div>
                  <p className="text-sm text-indigo-300">Autenticando...</p>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all duration-200 flex items-center justify-center gap-3 touch-target"
            >
              {isLoading ? (
                <>
                  <SmoothSpinner size="sm" />
                  Autenticando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              )}
            </motion.button>

            {/* Forgot Password Link */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-slate-400 hover:text-indigo-400 font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <HelpCircle className="w-4 h-4" />
                Esqueci minha senha
              </button>
            </div>
          </form>

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <ForgotPasswordModal
              onClose={() => setShowForgotPassword(false)}
              onNotification={(message, type) => {
                addNotification?.(message, type as any);
              }}
              onCreateUrgentCard={cardData => {
                // TODO: Implement urgent card creation
                console.log('Create urgent card:', cardData);
              }}
            />
          )}

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-slate-700/30">
            <p className="text-center text-xs text-slate-500">
              Sistema seguro com autenticação RBAC
            </p>
            <p className="text-center text-xs text-slate-600 mt-1">
              © 2026 Agenda QA - Todos os direitos reservados
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Login;