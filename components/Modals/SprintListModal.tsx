import React from 'react';
import { X, Calendar, Target, CheckCircle, Clock, Plus, ArrowRight } from 'lucide-react';
import { Sprint, Card } from '../../types';

interface SprintListModalProps {
  sprints: Sprint[];
  cards: Card[];
  onClose: () => void;
  onSelectSprint: (sprintId: string | null) => void;
  activeSprintId: string | null;
  onAddNewSprint: () => void;
}

const SprintListModal: React.FC<SprintListModalProps> = ({
  sprints,
  cards,
  onClose,
  onSelectSprint,
  activeSprintId,
  onAddNewSprint,
}) => {
  const getCompletionData = (sprintId: string) => {
    const sprintCards = cards.filter(c => c.sprintId === sprintId);

    let totalItems = 0;
    let completedItems = 0;

    sprintCards.forEach(card => {
      if (card.status === 'concluido') {
        totalItems += 1;
        completedItems += 1;
      } else {
        const subTasks = card.subTasks || [];
        if (subTasks.length > 0) {
          totalItems += subTasks.length;
          completedItems += subTasks.filter(st => st.concluida).length;
        } else {
          totalItems += 1;
        }
      }
    });

    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const cardsCompleted = sprintCards.filter(c => c.status === 'concluido').length;

    return { total: sprintCards.length, completed: cardsCompleted, percentage };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 h-[80vh]">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black dark:text-white flex items-center gap-2">
              <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Target className="w-5 h-5" />
              </span>
              Ciclos de Sprint
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-1">
              Gerenciamento de Tempo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-8 overflow-y-auto space-y-4">
          <button
            onClick={() => {
              onSelectSprint(null);
              onClose();
            }}
            className={`group w-full p-5 rounded-[2rem] border-2 transition-all text-left flex items-center justify-between ${
              activeSprintId === null
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/10'
                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/30 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl ${activeSprintId === null ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}
              >
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Visão Global</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Todas as tarefas sem filtro de sprint
                </p>
              </div>
            </div>
            {activeSprintId === null && (
              <CheckCircle className="w-6 h-6 text-indigo-600 animate-in zoom-in" />
            )}
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Sprints Ativas & Planejadas
            </span>
            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
          </div>

          {sprints.map(sprint => {
            const { total, completed, percentage } = getCompletionData(sprint.id);
            const isActive = activeSprintId === sprint.id;

            return (
              <div
                key={sprint.id}
                onClick={() => {
                  onSelectSprint(sprint.id);
                  onClose();
                }}
                className={`relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer group hover:scale-[1.01] ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-xl shadow-indigo-500/10'
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {sprint.nome}
                      </h3>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide border ${
                          sprint.status === 'concluida'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : sprint.status === 'ativa'
                              ? 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {sprint.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm">
                      {sprint.objetivo}
                    </p>
                  </div>
                  {isActive ? (
                    <CheckCircle className="w-6 h-6 text-indigo-600" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-bold">
                      <span className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2 py-1 rounded-md shadow-sm">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        {sprint.dataInicio} - {sprint.dataFim}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {completed}/{total} tasks
                      </span>
                    </div>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        sprint.status === 'concluida'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onAddNewSprint}
            className="w-full py-4 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all"
          >
            <Plus className="w-4 h-4" />
            Criar Nova Sprint
          </button>
        </div>
      </div>
    </div>
  );
};

export default SprintListModal;
