import React, { useState } from 'react';
import { X, Archive, Calendar, Target, ArrowRight, Eye, Filter, Search } from 'lucide-react';
import { Sprint, Card } from '../types';
import UnarchiveSprintModal from './Modals/UnarchiveSprintModal';

interface ArchivedSprintsViewProps {
  sprints: Sprint[];
  cards: Card[];
  onClose: () => void;
  onUnarchiveSprint: (sprintId: string, newStatus: 'planejada' | 'ativa') => void;
  onSelectSprint: (sprintId: string) => void;
}

const ArchivedSprintsView: React.FC<ArchivedSprintsViewProps> = ({
  sprints,
  cards,
  onClose,
  onUnarchiveSprint,
  onSelectSprint
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [sprintToUnarchive, setSprintToUnarchive] = useState<Sprint | null>(null);

  const archivedSprints = sprints.filter(sprint => sprint.status === 'arquivada');
  
  const filteredSprints = archivedSprints.filter(sprint =>
    sprint.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sprint.objetivo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSprintStats = (sprintId: string) => {
    const sprintCards = cards.filter(c => c.sprintId === sprintId);
    const completedCards = sprintCards.filter(c => c.status === 'concluido');
    const pendingCards = sprintCards.filter(c => c.status !== 'concluido');
    
    return {
      total: sprintCards.length,
      completed: completedCards.length,
      pending: pendingCards.length,
      percentage: sprintCards.length > 0 
        ? Math.round((completedCards.length / sprintCards.length) * 100)
        : 0
    };
  };

  const handleUnarchive = (sprint: Sprint) => {
    setSprintToUnarchive(sprint);
    setShowUnarchiveModal(true);
  };

  const confirmUnarchive = (newStatus: 'planejada' | 'ativa') => {
    if (sprintToUnarchive) {
      onUnarchiveSprint(sprintToUnarchive.id, newStatus);
      setShowUnarchiveModal(false);
      setSprintToUnarchive(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/20 dark:to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
                <Archive className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black dark:text-white">
                  Sprints Arquivadas
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  {archivedSprints.length} sprints armazenadas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar sprints arquivadas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {filteredSprints.length} resultados
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredSprints.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">
                Nenhuma sprint arquivada encontrada
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                {searchTerm 
                  ? 'Nenhuma sprint corresponde à sua busca' 
                  : 'Todas as sprints estão ativas'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSprints.map(sprint => {
                const stats = getSprintStats(sprint.id);
                
                return (
                  <div 
                    key={sprint.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => onSelectSprint(sprint.id)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                            {sprint.nome}
                          </h3>
                          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                            Arquivada
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md">
                          {sprint.objetivo}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleUnarchive(sprint)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                          title="Restaurar sprint"
                        >
                          <Archive className="w-4 h-4 rotate-180" />
                        </button>
                        <button
                          onClick={() => onSelectSprint(sprint.id)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                          title="Ver cards"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Sprint Details */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs mb-3">
                        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-bold">
                          <span className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2 py-1 rounded-md shadow-sm">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                            {sprint.dataInicio} - {sprint.dataFim}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5" />
                            {stats.completed}/{stats.total} tasks
                          </span>
                        </div>
                        <span className="font-black text-indigo-600 dark:text-indigo-400">
                          {stats.percentage}%
                        </span>
                      </div>
                      
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-slate-500 to-slate-600 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${stats.percentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex gap-4 mt-3 text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          ✓ {stats.completed} concluídos
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          ○ {stats.pending} pendentes
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Archive className="w-4 h-4" />
                {archivedSprints.length} sprints arquivadas
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                {cards.filter(c => archivedSprints.some(s => s.id === c.sprintId)).length} cards associados
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {/* Unarchive Modal */}
      {showUnarchiveModal && sprintToUnarchive && (
        <UnarchiveSprintModal
          sprint={sprintToUnarchive}
          cards={cards}
          onClose={() => {
            setShowUnarchiveModal(false);
            setSprintToUnarchive(null);
          }}
          onConfirm={confirmUnarchive}
        />
      )}
    </div>
  );
};

export default ArchivedSprintsView;