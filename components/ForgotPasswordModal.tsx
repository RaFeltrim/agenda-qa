import React, { useState } from 'react';
import { X, Mail, AlertCircle, CheckCircle, User, Clock, Shield } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  onCreateUrgentCard: (cardData: {
    titulo: string;
    descricao: string;
    responsavel: string;
  }) => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  onClose,
  onNotification,
  onCreateUrgentCard,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'sent' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu email');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Verificar se usuário existe
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('full_name, username, role')
        .eq('username', email.split('@')[0]) // Extrai username do email
        .single();

      if (userError || !userData) {
        setStep('error');
        setErrorMessage('Usuário não encontrado');
        return;
      }

      // Enviar email de recuperação via Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Criar card urgente para o admin (você)
      onCreateUrgentCard({
        titulo: `[URGENTE] Solicitação de Redefinição de Senha`,
        descricao: `O usuário **${userData.full_name}** (${userData.username}) solicitou redefinição de senha.

**Email:** ${email}
**Data/Hora:** ${new Date().toLocaleString('pt-BR')}

Por favor, entre em contato para auxiliar na redefinição.`,
        responsavel: 'Board_RFeltrim',
      });

      // Enviar notificação para o admin
      onNotification(`Nova solicitação de senha de ${userData.full_name}`, 'warning');

      setStep('sent');
    } catch (err) {
      setStep('error');
      setErrorMessage(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setStep('form');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Esqueci minha senha</h2>
              <p className="text-xs text-slate-400">Recuperação de acesso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-300 mb-2">
                  Email de acesso
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="seu.email@empresa.com"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">Informe o email utilizado no cadastro</p>
              </div>

              {errorMessage && (
                <div className="rounded-2xl bg-red-900/30 border border-red-800/50 p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                    <p className="text-sm text-red-300">{errorMessage}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
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
                    Processando...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Enviar instruções
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'sent' && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-green-500 rounded-3xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Instruções enviadas!</h3>
                <p className="text-slate-400">
                  Enviamos um email com instruções para redefinir sua senha.
                  <br />
                  Verifique sua caixa de entrada.
                </p>
              </div>
              <div className="bg-slate-900/30 rounded-2xl p-4 border border-slate-700">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-amber-400 mb-1">Aviso importante</p>
                    <p className="text-xs text-slate-400">
                      Uma solicitação foi registrada e um card urgente foi criado para o
                      administrador.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-colors"
              >
                Fechar
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-red-500 rounded-3xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Erro na solicitação</h3>
                <p className="text-slate-400 mb-4">{errorMessage}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resetForm}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl transition-colors"
                >
                  Tentar novamente
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4" />
            <span>Sistema seguro com auditoria completa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
