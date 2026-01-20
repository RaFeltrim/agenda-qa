import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Download, History, Search, User, Settings, LogOut, Archive, Folder } from 'lucide-react';
import { getUserInitials } from '../utils/userUtils';
import AccountModal from './Modals/AccountModal';
import PreferencesModal from './Modals/PreferencesModal';

interface HeaderProps {
  isDark: boolean;
  toggleDark: (dark: boolean) => void;
  onImportClick: () => void;
  onExportClick: () => void;
  onAuditLogClick: () => void;
  onArchivedSprintsClick?: () => void;
  onProjectsClick?: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
<<<<<<< Updated upstream
  userRole?: 'editor' | 'viewer' | null;
<<<<<<< HEAD
  userFullName?: string;
=======
=======
  userRole?: 'editor' | 'viewer' | 'admin' | null;
  userFullName?: string;
>>>>>>> Stashed changes
>>>>>>> dev
  onLogout?: () => void;
  onAdminClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isDark,
  toggleDark,
  onExportClick,
  onAuditLogClick,
  onArchivedSprintsClick,
  onProjectsClick,
  searchTerm,
  setSearchTerm,
  userRole,
  userFullName,
  onLogout,
  onAdminClick,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  const getUserRoleLabel = () => {
    if (userRole === 'editor') return 'Editor';
    if (userRole === 'viewer') return 'Visualizador';
    return 'Não autenticado';
  };

  const getUserRoleColor = () => {
    if (userRole === 'editor') return 'text-green-600 dark:text-green-400';
    if (userRole === 'viewer') return 'text-blue-600 dark:text-blue-400';
    return 'text-slate-400';
  };

  const handleLogout = () => {
    if (onLogout) {
      // Add smooth fade-out effect before logout
      const header = document.querySelector('header');
      if (header) {
        header.classList.add('animate-fade-out');
      }

      // Delay logout slightly to show animation
      setTimeout(() => {
        onLogout();
        // Force page refresh to ensure clean state
        window.location.reload();
      }, 300);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-6">
        {/* Logo Section */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
            A
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent leading-none tracking-tight">
              Agenda Kanban
            </h1>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mt-1 opacity-80">
              v3.0 PRO
            </p>
          </div>
        </div>

        {/* Dynamic Search Bar */}
        <div className="flex-1 max-w-lg relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Pressione Ctrl + K para buscar cards..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-sm font-medium shadow-inner"
          />
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/20 dark:border-slate-700/20">
            <button
              onClick={onAuditLogClick}
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
              title="Audit Log"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={onExportClick}
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
              title="Exportar Markdown"
            >
              <Download className="w-5 h-5" />
            </button>
            {userRole === 'editor' && (
              <button
                onClick={onProjectsClick}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
                title="Gerenciar Projetos"
              >
                <Folder className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

          {/* Enhanced Theme Toggle */}
          <div className="relative group">
            <button
              onClick={() => toggleDark(!isDark)}
              className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl hover:ring-4 hover:ring-indigo-500/20 transition-all shadow-sm group"
              aria-label={`Alternar para modo ${isDark ? 'escuro' : 'claro'}`}
            >
              <div className="relative w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full transition-all duration-300 ease-in-out overflow-hidden">
                {/* Slider thumb */}
                <div 
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out transform ${
                    isDark ? 'translate-x-1' : 'translate-x-7 bg-amber-400'
                  }`}
                >
                  {/* Inner glow for sun */}
                  {!isDark && (
                    <div className="absolute inset-0 bg-amber-300 rounded-full animate-pulse opacity-30"></div>
                  )}
                </div>
                
                {/* Icons inside the track */}
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300 transition-opacity duration-300">
                  <Moon className="w-3 h-3" />
                </div>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-amber-400 transition-opacity duration-300">
                  <Sun className="w-3 h-3" />
                </div>
              </div>
              
              {/* Theme label */}
              <span className="text-sm font-black text-slate-600 dark:text-slate-300 hidden sm:inline-block tracking-wide">
                {isDark ? 'Escuro' : 'Claro'}
              </span>
            </button>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Alternar tema ({isDark ? 'Escuro' : 'Claro'})
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900 dark:border-t-slate-700"></div>
            </div>
          </div>

          {/* Enhanced Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center p-0.5 hover:ring-4 hover:ring-indigo-500/20 transition-all shadow-md active:scale-95"
            >
              <div
                className={`w-full h-full rounded-xl flex items-center justify-center font-black text-xs ${
                  userRole === 'editor'
                    ? 'bg-green-500 text-white'
                    : userRole === 'viewer'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-300 text-slate-600'
                }`}
              >
                {getUserInitials(userFullName)}
              </div>
            </button>

            {showProfileMenu && (
              <>
<<<<<<< Updated upstream
                <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
<<<<<<< HEAD
                <div className="absolute right-0 mt-4 w-64 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/70 rounded-3xl shadow-2xl py-3 z-20 animate-in fade-in slide-in-from-top-4 duration-300">
=======
                <div className="absolute right-0 mt-4 w-64 glass dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl shadow-2xl py-3 z-20 animate-in fade-in slide-in-from-top-4 duration-300">
=======
                <div className="fixed inset-0 z-50" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 mt-12 w-64 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/70 rounded-3xl shadow-2xl py-3 z-60 animate-in fade-in slide-in-from-top-4 duration-300">
>>>>>>> Stashed changes
>>>>>>> dev
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">
                      Perfil Ativo
                    </p>
                    <p className="text-base font-black dark:text-white">Usuário Autenticado</p>
                    <p
                      className={`text-[11px] font-extrabold flex items-center gap-1.5 mt-1 ${getUserRoleColor()}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full animate-pulse ${
                          userRole === 'editor'
                            ? 'bg-green-500'
                            : userRole === 'viewer'
                              ? 'bg-blue-500'
                              : 'bg-slate-500'
                        }`}
                      ></span>
                      {getUserRoleLabel()}
                    </p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowAccountModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-xl transition-all"
                    >
                      <User className="w-4 h-4" /> Conta
                    </button>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowPreferencesModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-xl transition-all"
                    >
                      <Settings className="w-4 h-4" /> Preferências
                    </button>
<<<<<<< HEAD
=======
<<<<<<< Updated upstream
=======
>>>>>>> dev
                    {userRole === 'editor' && (
                      <>
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-3" />
                        <button 
                          onClick={() => {
                            setShowProfileMenu(false);
                            if (onArchivedSprintsClick) onArchivedSprintsClick();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-xl transition-all"
                        >
                          <Archive className="w-4 h-4" /> Sprints Arquivadas
                        </button>
                      </>
                    )}
<<<<<<< HEAD
=======
                    {userRole === 'admin' && (
                      <>
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-3" />
                        <button 
                          onClick={() => {
                            setShowProfileMenu(false);
                            if (onAdminClick) onAdminClick();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all"
                        >
                          <Settings className="w-4 h-4" /> Painel Administrativo
                        </button>
                      </>
                    )}
>>>>>>> Stashed changes
>>>>>>> dev
                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-3" />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (confirm('Deseja mesmo sair?')) {
                          handleLogout();
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sair da Conta
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Modals */}
          <AccountModal 
            isOpen={showAccountModal}
            onClose={() => setShowAccountModal(false)}
            onNotification={(message, type) => {
              // TODO: Add notification system to Header or pass from parent
              console.log(`[${type}] ${message}`);
            }}
          />
          
          <PreferencesModal 
            isOpen={showPreferencesModal}
            onClose={() => setShowPreferencesModal(false)}
            onNotification={(message, type) => {
              // TODO: Add notification system to Header or pass from parent
              console.log(`[${type}] ${message}`);
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
