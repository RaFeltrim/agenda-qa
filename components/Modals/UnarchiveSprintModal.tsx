import React, { useState } from 'react';
import { X, Undo, ArchiveRestore, Calendar, Target, ArrowRight, CheckCircle } from 'lucide-react';
import { Sprint, Card } from '../../types';

interface UnarchiveSprintModalProps {
  sprint: Sprint;
  cards: Card[];
  onClose: () => void;
  onConfirm: (newStatus: 'planejada' | 'ativa') => void;
}

const UnarchiveSprintModal: React.FC<UnarchiveSprintModalProps> = ({
  sprint,
  cards,
  onClose,
  onConfirm
}) => {
  const [newStatus, setNewStatus] = useState<'planejada' | 'ativa'>('planejada');
  
  const sprintCards = cards.filter(c => c.sprintId === sprint.id);
  const doneCards = sprintCards.filter(c => c.status === 'concluido');
  const pendingCards = sprintCards.filter(c => c.status !== 'concluido');

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/10">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                <ArchiveRestore className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black dark:text-white">
                  Restaurar {sprint.nome}
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  DESFAZER ARQUIVAÇÃO DA SPRINT
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Success Message */}
          <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl">
            <div className="flex items-start gap-3">
              <Undo className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black text-emerald-800 dark:text-emerald-200 text-sm uppercase tracking-widest mb-2">
                  ✅ RESTAURAÇÃO POSSÍVEL
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  Esta sprint pode ser restaurada para o status de <strong>"Planejada"</strong> ou <strong>"Ativa"</strong>. 
                  Os cards associados manterão suas informações originais.
                </p>
              </div>
            </div>
          </div>

          {/* Sprint Details */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <h3 className="font-black text-slate-700 dark:text-slate-300 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Informações da Sprint
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Período Original:</span>
                <p className="font-medium text-slate-900 dark:text-white">
                  {sprint.dataInicio} → {sprint.dataFim}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Status Atual:</span>
                <p className="font-medium capitalize text-slate-900 dark:text-white">
                  {sprint.status}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Total de Cards:</span>
                <p className="font-medium text-slate-900 dark:text-white">
                  {sprintCards.length} cards
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Concluídos:</span>
                <p className="font-medium text-emerald-600 dark:text-emerald-400">
                  {doneCards.length} cards
                </p>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-4">
            <h3 className="font-black text-slate-700 dark:text-slate-300 text-sm uppercase tracking-widest flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Escolher Novo Status
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setNewStatus('planejada')}
                className={`p-4 rounded-2xl border-2 transition-all text-center ${
                  newStatus === 'planejada'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <div className={`p-3 rounded-xl mx-auto mb-2 transition-colors ${
                  newStatus === 'planejada' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  <Calendar className="w-5 h-5 mx-auto" />
                </div>
                <p className={`font-bold text-sm ${
                  newStatus === 'planejada' 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  Planejada
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Para futura execução
                </p>
              </button>
              
              <button
                onClick={() => setNewStatus('ativa')}
                className={`p-4 rounded-2xl border-2 transition-all text-center ${
                  newStatus === 'ativa'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700'
                }`}
              >
                <div className={`p-3 rounded-xl mx-auto mb-2 transition-colors ${
                  newStatus === 'ativa' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  <CheckCircle className="w-5 h-5 mx-auto" />
                </div>
                <p className={`font-bold text-sm ${
                  newStatus === 'ativa' 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  Ativa
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Para execução imediata
                </p>
              </button>
            </div>
          </div>

          {/* Impact Information */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-2">
              O que acontecerá ao restaurar:
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>A sprint voltará a aparecer na lista principal de sprints</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Todos os cards associados voltarão a ser vinculados a esta sprint</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>O status escolhido determinará a visibilidade e disponibilidade da sprint</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Cancelar
          </button>
          
          <button
            onClick={() => onConfirm(newStatus)}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            <ArchiveRestore className="w-4 h-4" />
            Restaurar Sprint
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnarchiveSprintModal;