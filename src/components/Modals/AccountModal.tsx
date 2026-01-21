// Account Management Modal Component
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Edit3, Save, Camera, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Profile } from '../../services/supabaseClient';
import { validatePassword } from '../../services/authService';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotification?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onNotification }) => {
  const { profile, user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with current profile data
  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.username || user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [profile, user, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nome completo é obrigatório';
    }

    if (isChangingPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Senha atual é obrigatória';
      }
      
      if (formData.newPassword) {
        const passwordValidation = validatePassword(formData.newPassword);
        if (!passwordValidation.valid) {
          newErrors.newPassword = passwordValidation.errors[0] || 'Senha inválida';
        }
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Implement profile update API call
      // This would typically call a service to update the user profile
      
      if (isChangingPassword) {
        // Implement actual password change
        const { changePassword } = await import('../../services/authService');
        const result = await changePassword(formData.newPassword);
        
        if (result.success) {
          onNotification?.('Senha alterada com sucesso!', 'success');
          // Reset password fields
          setFormData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }));
          setIsChangingPassword(false);
        } else {
          onNotification?.(result.error || 'Erro ao alterar senha', 'error');
          return;
        }
      }

      onNotification?.('Perfil atualizado com sucesso!', 'success');
      setIsEditing(false);
      setIsChangingPassword(false);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      onNotification?.('Erro ao atualizar perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden mt-16"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Minha Conta
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gerencie suas informações pessoais
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                  {profile ? 
                    profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() :
                    '??'
                  }
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-200 dark:border-slate-600"
                >
                  <Camera className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Foto de Perfil
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  PNG, JPG ou GIF (máx. 2MB)
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.full_name 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                      !isEditing ? 'opacity-75' : ''
                    }`}
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-300 opacity-75"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    O email não pode ser alterado
                  </p>
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Segurança
                </h3>
                {!isChangingPassword && (
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(true)}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Alterar Senha
                  </button>
                )}
              </div>

              {isChangingPassword && (
                <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Senha Atual *
                    </label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      autoComplete="current-password"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.currentPassword 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'
                      } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-colors`}
                      placeholder="Digite sua senha atual"
                    />
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Nova Senha *
                    </label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      autoComplete="new-password"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.newPassword 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'
                      } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-colors`}
                      placeholder="Digite sua nova senha"
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Confirmar Nova Senha *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      autoComplete="new-password"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.confirmPassword 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'
                      } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-colors`}
                      placeholder="Confirme sua nova senha"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setFormData(prev => ({
                          ...prev,
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        }));
                        setErrors({});
                      }}
                      className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Role Information */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">Informações do Perfil</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Cargo:</span>
                  <span className="font-bold text-slate-900 dark:text-white ml-2">
                    {profile?.role === 'editor' ? 'Editor' : 'Visualizador'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Status:</span>
                  <span className="font-bold text-green-600 ml-2">Ativo</span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Membro desde:</span>
                  <span className="font-bold text-slate-900 dark:text-white ml-2">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Último acesso:</span>
                  <span className="font-bold text-slate-900 dark:text-white ml-2">
                    {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-6 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Fechar
          </button>
          
          <div className="flex gap-3">
            {!isEditing && !isChangingPassword && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </button>
            )}
            
            {(isEditing || isChangingPassword) && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setIsChangingPassword(false);
                    setErrors({});
                  }}
                  className="px-6 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountModal;