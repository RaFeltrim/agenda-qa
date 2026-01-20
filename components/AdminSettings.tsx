import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Settings, Sparkles, Shield, User, Key, Save } from 'lucide-react';

interface AdminSettingsProps {
  onClose: () => void;
  userRole: string;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ onClose, userRole }) => {
  // Check if user has admin role
  const isAdmin = userRole === 'admin';
  
  // State for Gemini integration toggle
  const [geminiEnabled, setGeminiEnabled] = useState(false);
  
  // State for user management (basic reset functionality)
  const [resetEmail, setResetEmail] = useState('');
  const [resetUserId, setResetUserId] = useState('');

  if (!isAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
            Acesso Restrito
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Esta área é exclusiva para administradores do sistema.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors"
          >
            Voltar
          </button>
        </motion.div>
      </motion.div>
    );
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('gemini_integration_enabled', geminiEnabled.toString());
    alert('✅ Configurações salvas com sucesso!');
  };

  const handleResetPassword = () => {
    if (!resetEmail.trim()) {
      alert('⚠️ Por favor, informe um email válido');
      return;
    }
    
    // Simulate password reset
    alert(`✅ Solicitação de reset enviada para: ${resetEmail}`);
    setResetEmail('');
  };

  const handleResetUserAccess = () => {
    if (!resetUserId.trim()) {
      alert('⚠️ Por favor, informe um ID de usuário válido');
      return;
    }
    
    // Simulate user access reset
    alert(`✅ Acesso do usuário ${resetUserId} foi resetado`);
    setResetUserId('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">Painel Administrativo</h2>
                <p className="text-indigo-100 text-sm">Configurações do Sistema</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {/* Gemini Integration Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl text-yellow-600 dark:text-yellow-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Integração Gemini AI
                </h3>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Habilitar Integração Gemini</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Ativa os recursos de inteligência artificial do Gemini para geração de conteúdo
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={geminiEnabled}
                      onChange={(e) => setGeminiEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-xl">
                  <strong>Status:</strong> {geminiEnabled ? '🟢 Ativado' : '🔴 Desativado'}
                </div>
              </div>
            </section>

            {/* User Management Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Gestão de Usuários
                </h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Reset Password */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Reset de Senha
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Enviar link de redefinição de senha para o usuário
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="email@empresa.com"
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleResetPassword}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm"
                    >
                      Enviar Reset
                    </button>
                  </div>
                </div>

                {/* Reset User Access */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Reset de Acesso
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Resetar permissões e acesso do usuário
                  </p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={resetUserId}
                      onChange={(e) => setResetUserId(e.target.value)}
                      placeholder="ID do usuário"
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleResetUserAccess}
                      className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors text-sm"
                    >
                      Resetar Acesso
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveSettings}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Configurações
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminSettings;