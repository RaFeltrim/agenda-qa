import React, { useState } from 'react';
import { X, AlertTriangle, Archive, CheckCircle, ArrowRight, Calendar, Target } from 'lucide-react';
import { Sprint, Card } from '../../types';

interface ArchiveSprintModalProps {
  sprint: Sprint;
  cards: Card[];
  onClose: () => void;
  onConfirm: (moveToBacklog: boolean) => void;
}

const ArchiveSprintModal: React.FC<ArchiveSprintModalProps> = ({
  sprint,
  cards,
  onClose,
  onConfirm
}) => {
  const [moveToBacklog, setMoveToBacklog] = useState(true);
  
  const sprintCards = cards.filter(c => c.sprintId === sprint.id);
  const doneCards = sprintCards.filter(c => c.status === 'concluido');
  const pendingCards = sprintCards.filter(c => c.status !== 'concluido');

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/10">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-rose-50 to-white dark:from-rose-900/20 dark:to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black dark:text-white">
                  Arquivar {sprint.nome}
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  AÇÃO IRREVERSÍVEL COM IMPACTOS PERMANENTES
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

        {/* Warning Content */}
        <div className="p-8 space-y-6">
          {/* Critical Warning */}
          <div className="p-5 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black text-rose-800 dark:text-rose-200 text-sm uppercase tracking-widest mb-2">
                  ⚠️ AVISO IMPORTANTE
                </h3>
                <p className="text-sm text-rose-700 dark:text-rose-300 leading-relaxed">
                  Esta ação irá <strong className="underline">permanentemente arquivar</strong> a sprint "{sprint.nome}". 
                  Embora seja possível visualizar sprints arquivadas, <strong>não será possível desarquivar</strong> esta sprint após a confirmação.
                </p>
              </div>
            </div>
          </div>

          {/* Sprint Details */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <h3 className="font-black text-slate-700 dark:text-slate-300 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Detalhes da Sprint
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Período:</span>
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

          {/* Impact Analysis */}
          <div className="space-y-4">
            <h3 className="font-black text-slate-700 dark:text-slate-300 text-sm uppercase tracking-widest flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Impactos da Arquivação
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 dark:text-amber-200 text-sm">
                    Cards Pendentes ({pendingCards.length})
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Serão movidos para o backlog e perderão a associação com esta sprint
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-800 dark:text-emerald-200 text-sm">
                    Cards Concluídos ({doneCards.length})
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                    Manterão seu status de conclusão mas ficarão órfãos (sem sprint associada)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <input
              type="checkbox"
              id="confirm-archive"
              checked={moveToBacklog}
              onChange={(e) => setMoveToBacklog(e.target.checked)}
              className="mt-1 w-4 h-4 text-rose-600 bg-white border-slate-300 rounded focus:ring-rose-500 dark:focus:ring-rose-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
            />
            <label htmlFor="confirm-archive" className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-bold">Confirmo que entendo os impactos permanentes</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Entendo que esta ação não poderá ser desfeita e que os cards serão movidos conforme descrito acima.
              </p>
            </label>
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
            onClick={() => onConfirm(moveToBacklog)}
            disabled={!moveToBacklog}
            className={`flex-1 py-3 px-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              moveToBacklog
                ? 'bg-rose-600 hover:bg-rose-700 text-white hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/20'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <Archive className="w-4 h-4" />
            Arquivar Permanentemente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveSprintModal;