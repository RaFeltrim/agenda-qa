import React from 'react';
import { Card, Sprint } from '../../../types';
import { Target, ChevronDown } from 'lucide-react';

interface SprintAssignmentProps {
  card: Card;
  sprints: Sprint[];
  activeSprintId: string | null;
  isEditing: boolean;
  onUpdateCard: (updatedCard: Card) => void;
}

const SprintAssignment: React.FC<SprintAssignmentProps> = ({
  card,
  sprints,
  activeSprintId,
  isEditing,
  onUpdateCard,
}) => {
  const currentSprint = sprints.find(s => s.id === card.sprintId);
  const activeSprint = sprints.find(s => s.id === activeSprintId);

  const handleSprintChange = (sprintId: string | null) => {
    const updatedCard: Card = {
      ...card,
      historico: [
        ...card.historico,
        {
          acao: sprintId 
            ? `Movido para sprint: ${sprints.find(s => s.id === sprintId)?.nome || sprintId}`
            : 'Removido da sprint (movido para backlog)',
          por: 'Usuário',
          em: new Date().toISOString()
        }
      ]
    };
    
    // Handle sprintId assignment properly
    if (sprintId) {
      updatedCard.sprintId = sprintId;
    } else {
      delete updatedCard.sprintId;
    }
    
    onUpdateCard(updatedCard);
  };

  if (!isEditing) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Sprint Assignment
        </h4>
        {currentSprint ? (
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              currentSprint.status === 'ativa' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : currentSprint.status === 'concluida'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              {currentSprint.nome}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {currentSprint.status === 'ativa' ? '(Ativa)' : 
               currentSprint.status === 'concluida' ? '(Concluída)' : '(Planejada)'}
            </span>
          </div>
        ) : (
          <div className="text-xs text-slate-500 dark:text-slate-400 italic">
            Não atribuído a nenhuma sprint (Backlog)
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-indigo-300 ring-4 ring-indigo-500/10">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <Target className="w-4 h-4" />
        Alterar Sprint
      </h4>
      
      <div className="space-y-2">
        {/* Option to remove from sprint (backlog) */}
        <button
          onClick={() => handleSprintChange(null)}
          className={`w-full text-left p-3 rounded-xl border transition-all ${
            !card.sprintId
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>Sem sprint (Backlog)</span>
            {!card.sprintId && <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>}
          </div>
        </button>

        {/* Active sprint option */}
        {activeSprint && activeSprint.id !== card.sprintId && (
          <button
            onClick={() => handleSprintChange(activeSprint.id)}
            className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-blue-700 dark:text-blue-400">{activeSprint.nome}</div>
                <div className="text-xs text-blue-500 dark:text-blue-300">Sprint atual (ativa)</div>
              </div>
              <ChevronDown className="w-4 h-4 text-blue-500" />
            </div>
          </button>
        )}

        {/* Other sprints */}
        {sprints
          .filter(sprint => sprint.id !== card.sprintId && sprint.id !== activeSprintId)
          .map(sprint => (
            <button
              key={sprint.id}
              onClick={() => handleSprintChange(sprint.id)}
              className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{sprint.nome}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {sprint.status === 'ativa' ? 'Ativa' : 
                     sprint.status === 'concluida' ? 'Concluída' : 'Planejada'}
                  </div>
                </div>
                {card.sprintId === sprint.id && <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>}
              </div>
            </button>
          ))}
      </div>

      {card.sprintId && (
        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            <strong>Aviso:</strong> Alterar a sprint afetará onde este card aparece no kanban.
          </p>
        </div>
      )}
    </div>
  );
};

export default SprintAssignment;