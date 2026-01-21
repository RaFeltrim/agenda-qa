import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, Calendar, Shield } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
  userRole: 'editor' | 'viewer' | null;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, userRole }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 5;

  const steps = [
    {
      title: 'Bem-vindo ao Agenda Kanban!',
      subtitle: 'Sistema de gerenciamento ágil para equipes QA',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
            <Calendar className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-3">Comece sua jornada ágil</h3>
            <p className="text-slate-300 leading-relaxed">
              Este tour interativo vai te mostrar todas as funcionalidades do sistema.
              <br />
              Em {totalSteps} passos rápidos, você dominará o Kanban Board!
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
            <p className="text-sm text-slate-400 font-medium">
              <Shield className="w-4 h-4 inline mr-2 text-green-400" />
              Sua role atual:{' '}
              <span className="text-white font-bold">
                {userRole === 'editor' ? 'EDITOR (Acesso Completo)' : 'VIEWER (Visualização)'}
              </span>
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Dashboard Inteligente',
      subtitle: 'Visão geral do seu trabalho',
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700">
            <p className="text-slate-300">
              Monitore cards por status, sprints ativos e reuniões agendadas em um só lugar.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Criar Novas Tarefas',
      subtitle: 'Adicione cards rapidamente',
      content: (
        <div className="space-y-4">
          {userRole === 'editor' ? (
            <div className="p-4 bg-indigo-900/30 rounded-2xl border border-indigo-700">
              <p className="text-indigo-200">
                Como Editor, você pode criar novos cards usando o botão FAB (+) no canto inferior
                direito.
              </p>
            </div>
          ) : (
            <div className="p-6 bg-amber-900/30 rounded-2xl border border-amber-700 text-center">
              <p className="text-amber-200">
                Como Viewer, você pode apenas visualizar e comentar. A criação de cards é restrita a
                Editors.
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Funcionalidades Avançadas',
      subtitle: 'Assistente de IA e mais',
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700">
            <p className="text-slate-300">
              O sistema inclui assistente de voz, geração de dados com IA, relatórios estratégicos e
              muito mais!
            </p>
          </div>
          <div className="p-4 bg-amber-900/30 rounded-2xl border border-amber-700">
            <p className="text-amber-200 text-sm">
              Algumas funcionalidades avançadas requerem API Key do Google (pagas).
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Tour Concluído! 🎉',
      subtitle: 'Você está pronto para começar',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-3">Parabéns!</h3>
            <p className="text-slate-300 leading-relaxed">
              Você completou o tour completo do Agenda Kanban.
              <br />
              Agora você conhece todas as funcionalidades do sistema.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
          <div>
            <h2 className="text-xl font-black text-white">{steps[currentStep].title}</h2>
            <p className="text-slate-400 text-sm">{steps[currentStep].subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={skipTour}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm font-bold transition-colors"
            >
              Pular Tour
            </button>
            <button
              onClick={onComplete}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[400px]">{steps[currentStep].content}</div>

        {/* Progress and Navigation */}
        <div className="px-8 py-6 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-indigo-500 scale-125'
                      : index < currentStep
                        ? 'bg-green-500'
                        : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm font-medium">
                {currentStep + 1} de {totalSteps}
              </span>

              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="p-2 rounded-xl border border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {currentStep === totalSteps - 1 ? (
                <button
                  onClick={onComplete}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2"
                >
                  Começar a usar
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
