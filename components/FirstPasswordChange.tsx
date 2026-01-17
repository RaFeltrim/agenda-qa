import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Lock, Shield, CheckCircle, XCircle } from 'lucide-react';
import { validatePassword } from '../services/authService';

interface PasswordRequirement {
  id: string;
  text: string;
  met: boolean;
}

const FirstPasswordChange: React.FC = () => {
  const [currentPassword] = useState(''); // Will be pre-filled or empty
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { changePassword, isLoading, error, clearError } = useAuth();

  // Password validation
  const validation = validatePassword(newPassword);
  const requirements: PasswordRequirement[] = [
    { id: 'length', text: 'Pelo menos 6 caracteres', met: newPassword.length >= 6 },
    { id: 'uppercase', text: 'Pelo menos 1 letra maiúscula', met: /[A-Z]/.test(newPassword) },
    { id: 'lowercase', text: 'Pelo menos 1 letra minúscula', met: /[a-z]/.test(newPassword) },
    { id: 'number', text: 'Pelo menos 1 número', met: /[0-9]/.test(newPassword) },
    {
      id: 'special',
      text: 'Pelo menos 1 caractere especial (!@#$%^&*)',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.valid) {
      return;
    }

    if (newPassword !== confirmPassword) {
      clearError();
      return;
    }

    const result = await changePassword(newPassword);
    if (result.success) {
      // Success - redirect handled by App component
    }
  };

  const getPasswordStrengthColor = () => {
    if (validation.strength === 'strong') return 'bg-green-500';
    if (validation.strength === 'medium') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPasswordStrengthText = () => {
    if (validation.strength === 'strong') return 'Forte';
    if (validation.strength === 'medium') return 'Média';
    return 'Fraca';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-white shadow-2xl mx-auto mb-6">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">
            Alterar Senha
          </h1>
          <p className="text-slate-400">
            Esta é sua primeira vez acessando o sistema.
            <br />
            Por segurança, você precisa criar uma nova senha.
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password (Hidden for now - can be shown if needed) */}
            {currentPassword && (
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-bold text-slate-300 mb-2"
                >
                  Senha Atual
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    readOnly
                    className="w-full pl-12 pr-4 py-4 bg-slate-900/30 border border-slate-700 rounded-2xl text-slate-400 cursor-not-allowed"
                    placeholder="Senha temporária"
                  />
                </div>
              </div>
            )}

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-bold text-slate-300 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Crie uma senha forte"
                  disabled={isLoading}
                  autoFocus
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isLoading}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-500 hover:text-slate-300 transition-colors" />
                  )}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-slate-400">Força da senha:</span>
                    <span
                      className={`text-xs font-bold ${
                        validation.strength === 'strong'
                          ? 'text-green-400'
                          : validation.strength === 'medium'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }`}
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{
                        width: `${(requirements.filter(r => r.met).length / requirements.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Requirements List */}
              <div className="mt-4 space-y-2">
                {requirements.map(req => (
                  <div key={req.id} className="flex items-center text-sm">
                    {req.met ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                    )}
                    <span className={req.met ? 'text-green-400' : 'text-slate-400'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold text-slate-300 mb-2"
              >
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 bg-slate-900/50 border ${
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-red-500'
                      : 'border-slate-700'
                  } rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="Confirme sua nova senha"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-500 hover:text-slate-300 transition-colors" />
                  )}
                </button>
              </div>

              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />
                  As senhas não coincidem
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-2xl bg-red-900/30 border border-red-800/50 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isLoading ||
                !validation.valid ||
                newPassword !== confirmPassword ||
                !newPassword.trim()
              }
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Atualizando senha...
                </div>
              ) : (
                'Atualizar Senha'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-slate-700/30">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">
                  Sua senha será criptografada e armazenada com segurança.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Nunca compartilhe sua senha com ninguém.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstPasswordChange;
