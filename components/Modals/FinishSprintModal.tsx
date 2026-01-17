import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, Archive, Forward, Flag } from 'lucide-react';
import { Sprint, Card } from '../../types';

interface FinishSprintModalProps {
  sprint: Sprint;
  cards: Card[];
  nextSprints: Sprint[];
  onClose: () => void;
  onConfirm: (destinationSprintId: string | 'backlog') => void;
}

const FinishSprintModal: React.FC<FinishSprintModalProps> = ({
  sprint,
  cards,
  nextSprints,
  onClose,
  onConfirm,
}) => {
  const [destination, setDestination] = useState<string | 'backlog'>('backlog');

  const sprintCards = cards.filter(c => c.sprintId === sprint.id);
  const doneCards = sprintCards.filter(c => c.status === 'concluido');
  const pendingCards = sprintCards.filter(c => c.status !== 'concluido');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/10">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black dark:text-white flex items-center gap-2">
              <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Flag className="w-5 h-5" />
              </span>
              Finalizar {sprint.nome}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-1">
              Review & Retrospectiva
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Concluídos</span>
              </div>
              <p className="text-4xl font-black text-emerald-700 dark:text-emerald-400 tracking-tighter">
                {doneCards.length}
              </p>
            </div>
            <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/30">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Pendentes</span>
              </div>
              <p className="text-4xl font-black text-amber-700 dark:text-amber-400 tracking-tighter">
                {pendingCards.length}
              </p>
            </div>
          </div>

          {pendingCards.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                Ação Requerida ({pendingCards.length} itens)
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => setDestination('backlog')}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left group ${
                    destination === 'backlog'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl transition-colors ${destination === 'backlog' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200'}`}
                  >
                    <Archive className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      Mover para o Backlog
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      As tarefas ficarão sem sprint definida.
                    </p>
                  </div>
                </button>

                {nextSprints.length > 0 &&
                  nextSprints.map(next => (
                    <button
                      key={next.id}
                      onClick={() => setDestination(next.id)}
                      className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left group ${
                        destination === next.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl transition-colors ${destination === next.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200'}`}
                      >
                        <Forward className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          Mover para {next.nome}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Carryover para o próximo ciclo.
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(destination)}
            className="flex-[2] py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-wider shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            Encerrar Sprint
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinishSprintModal;
