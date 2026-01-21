// User Preferences Modal Component
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Settings, Bell, Palette, Globe, Monitor, Smartphone, Tablet, User, Shield } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useAuth } from '../../hooks/useAuth';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotification?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose, onNotification }) => {
  const [isDark, setIsDark] = useDarkMode();
  const { profile } = useAuth();
  const [preferences, setPreferences] = useState({
    // Theme Settings
    theme: 'system' as 'light' | 'dark' | 'system',
    accentColor: 'indigo',
    
    // Notification Settings
    emailNotifications: true,
    desktopNotifications: true,
    whatsappNotifications: false,
    soundEnabled: true,
    notificationFrequency: 'immediate' as 'immediate' | 'daily' | 'weekly',
    whatsappNumber: '',
    notificationTimeWindow: { start: '09:00', end: '18:00' },
    
    // Display Settings
    compactMode: false,
    animations: true,
    showAvatars: true,
    
    // Language & Region
    language: 'pt-BR',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Privacy Settings
    shareActivity: false,
    twoFactorAuth: false,
  });

  // Initialize preferences from localStorage or defaults
  useEffect(() => {
    if (isOpen) {
      const savedPrefs = localStorage.getItem('user_preferences');
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          setPreferences(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.warn('Failed to parse saved preferences');
        }
      }
      
      // Set theme based on current dark mode state
      setPreferences(prev => ({
        ...prev,
        theme: isDark ? 'dark' : 'light'
      }));
    }
  }, [isOpen, isDark]);

  // Save preferences to localStorage
  const savePreferences = () => {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
    
    // Apply theme changes
    if (preferences.theme === 'dark') {
      setIsDark(true);
    } else if (preferences.theme === 'light') {
      setIsDark(false);
    }
    // 'system' theme is handled by the useDarkMode hook
    
    onNotification?.('Preferências salvas com sucesso!', 'success');
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const getThemeIcon = () => {
    switch (preferences.theme) {
      case 'light': return <Monitor className="w-5 h-5" />;
      case 'dark': return <Smartphone className="w-5 h-5" />;
      case 'system': return <Globe className="w-5 h-5" />;
      default: return <Palette className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Preferências
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Personalize sua experiência
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
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Theme Settings */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Tema e Aparência
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'light', label: 'Claro', icon: Monitor },
                  { value: 'dark', label: 'Escuro', icon: Smartphone },
                  { value: 'system', label: 'Sistema', icon: Globe }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => handlePreferenceChange('theme', value)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      preferences.theme === value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2 text-slate-600 dark:text-slate-300" />
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {label}
                    </div>
                    {preferences.theme === value && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mx-auto mt-2"></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Modo Compacto</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Interface mais densa com menos espaçamento
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.compactMode}
                    onChange={(e) => handlePreferenceChange('compactMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </section>

            {/* Notification Settings */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações
              </h3>
              
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Notificações por Email', description: 'Receber atualizações por email' },
                  { key: 'desktopNotifications', label: 'Notificações Desktop', description: 'Mostrar notificações no navegador' },
                  { key: 'whatsappNotifications', label: 'Notificações WhatsApp', description: 'Receber alertas via WhatsApp (horário comercial)' },
                  { key: 'soundEnabled', label: 'Sons', description: 'Reproduzir sons para notificações importantes' }
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{label}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{description}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences[key as keyof typeof preferences] as boolean}
                        onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}

                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                  <div className="font-bold text-slate-900 dark:text-white mb-2">Frequência de Resumo</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    Com que frequência você quer receber resumos das atividades?
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'immediate', label: 'Imediato' },
                      { value: 'daily', label: 'Diário' },
                      { value: 'weekly', label: 'Semanal' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => handlePreferenceChange('notificationFrequency', value)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          preferences.notificationFrequency === value
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* WhatsApp Settings */}
                {preferences.whatsappNotifications && (
                  <div className="space-y-4 mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Configurações WhatsApp
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                        Receba notificações sobre tarefas próximas do vencimento
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Número WhatsApp (com DDD)
                      </label>
                      <input
                        type="tel"
                        value={preferences.whatsappNumber}
                        onChange={(e) => handlePreferenceChange('whatsappNumber', e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Horário Início
                        </label>
                        <input
                          type="time"
                          value={preferences.notificationTimeWindow.start}
                          onChange={(e) => handlePreferenceChange('notificationTimeWindow', { 
                            ...preferences.notificationTimeWindow, 
                            start: e.target.value 
                          })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Horário Fim
                        </label>
                        <input
                          type="time"
                          value={preferences.notificationTimeWindow.end}
                          onChange={(e) => handlePreferenceChange('notificationTimeWindow', { 
                            ...preferences.notificationTimeWindow, 
                            end: e.target.value 
                          })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>
                    
                    <div className="text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                      <strong>Como funciona:</strong> Você receberá notificações via WhatsApp sobre tarefas que estão próximas do vencimento (1 dia antes) durante o horário comercial configurado.
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Display Settings */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Exibição
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Animações</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Efeitos visuais e transições suaves
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.animations}
                      onChange={(e) => handlePreferenceChange('animations', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Mostrar Avatares</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Exibir fotos de perfil dos usuários
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.showAvatars}
                      onChange={(e) => handlePreferenceChange('showAvatars', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Privacy Settings */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacidade e Segurança
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                  <div className="font-bold text-slate-900 dark:text-white mb-2">Compartilhar Atividade</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    Permitir que outros vejam sua atividade recente
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.shareActivity}
                      onChange={(e) => handlePreferenceChange('shareActivity', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                  <div className="font-bold text-slate-900 dark:text-white mb-2">Autenticação de Dois Fatores</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    Adicionar camada extra de segurança à sua conta
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.twoFactorAuth}
                        onChange={(e) => handlePreferenceChange('twoFactorAuth', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                    <span className={`text-sm font-bold ${
                      preferences.twoFactorAuth 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {preferences.twoFactorAuth ? 'Ativado' : 'Desativado'}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Information */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações da Conta
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Nome</div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {profile?.full_name || 'Não definido'}
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Email</div>
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {profile?.username || 'Não definido'}
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Cargo</div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {profile?.role === 'editor' ? 'Editor' : 'Visualizador'}
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Membro Desde</div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {profile?.created_at 
                      ? new Date(profile.created_at).toLocaleDateString('pt-BR') 
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Todas as preferências são salvas automaticamente
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={savePreferences}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Salvar Preferências
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PreferencesModal;