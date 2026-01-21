import React, { useState } from 'react';
import { Target, Calendar, Plus, Edit3, Archive, Eye, Filter, Search } from 'lucide-react';
import { Sprint, Project } from '../types';

interface ProjectSprintsViewProps {
  project: Project | null;
  sprints: Sprint[];
  cards: any[]; // Card type would need to be imported
  onCreateSprint: (sprint: Omit<Sprint, 'id' | 'updatedAt'>) => void;
  onEditSprint: (sprint: Sprint) => void;
  onArchiveSprint: (sprintId: string) => void;
  onSelectSprint: (sprintId: string) => void;
  userRole: 'editor' | 'viewer' | null;
}

const ProjectSprintsView: React.FC<ProjectSprintsViewProps> = ({
  project,
  sprints,
  cards,
  onCreateSprint,
  onEditSprint,
  onArchiveSprint,
  onSelectSprint,
  userRole
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Sprint['status']>('all');

  // Filter sprints by project
  const projectSprints = project 
    ? sprints.filter(sprint => sprint.projectId === project.id)
    : sprints;

  // Apply search and status filters - exclude archived sprints by default
  const filteredSprints = projectSprints.filter(sprint => {
    const matchesSearch = sprint.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sprint.objetivo.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Exclude archived sprints unless specifically filtered for
    const isNotArchived = sprint.status !== 'arquivada';
    const matchesStatus = statusFilter === 'all' 
      ? isNotArchived 
      : sprint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getSprintStats = (sprintId: string) => {
    const sprintCards = cards.filter(c => c.sprintId === sprintId);
    const completedCards = sprintCards.filter(c => c.status === 'concluido');
    
    return {
      total: sprintCards.length,
      completed: completedCards.length,
      percentage: sprintCards.length > 0 
        ? Math.round((completedCards.length / sprintCards.length) * 100)
        : 0
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'planejada': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'concluida': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'arquivada': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativa': return 'Ativa';
      case 'planejada': return 'Planejada';
      case 'concluida': return 'Concluída';
      case 'arquivada': return 'Arquivada';
      default: return status;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            {project ? project.nome : 'Todas as Sprints'}
          </h2>
          {project && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {project.descricao}
            </p>
          )}
        </div>
        
        {userRole === 'editor' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all w-full sm:w-auto min-h-[44px] sm:min-h-0"
          >
            <Plus className="w-4 h-4" />
            Nova Sprint
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar sprints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[44px]"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-3 sm:py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-auto min-h-[44px]"
          >
            <option value="all">Todos os status</option>
            <option value="planejada">Planejada</option>
            <option value="ativa">Ativa</option>
            <option value="concluida">Concluída</option>
            <option value="arquivada">Arquivada</option>
          </select>
        </div>
      </div>

      {/* Create Sprint Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">Criar Nova Sprint</h3>
          {/* Sprint creation form would go here */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-3 sm:py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-sm transition-all min-h-[44px] sm:min-h-0"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Edit Sprint Form */}
      {editingSprint && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">Editar Sprint</h3>
          {/* Sprint edit form would go here */}
          <div className="flex gap-2">
            <button
              onClick={() => setEditingSprint(null)}
              className="px-4 py-3 sm:py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-sm transition-all min-h-[44px] sm:min-h-0"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Sprints Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSprints.map(sprint => {
          const stats = getSprintStats(sprint.id);
          
          return (
            <div 
              key={sprint.id}
              className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group cursor-pointer"
              onClick={() => onSelectSprint(sprint.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                      {sprint.nome}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${getStatusColor(sprint.status)}`}>
                      {getStatusLabel(sprint.status)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {sprint.objetivo}
                  </p>
                </div>
                
                {userRole === 'editor' && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSprint(sprint);
                      }}
                      className="p-2 sm:p-1 text-slate-400 hover:text-indigo-600 rounded transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Editar sprint"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {sprint.status !== 'arquivada' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Arquivar sprint "${sprint.nome}"?`)) {
                            onArchiveSprint(sprint.id);
                          }
                        }}
                        className="p-2 sm:p-1 text-slate-400 hover:text-rose-600 rounded transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Arquivar sprint"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Sprint Details */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    {sprint.dataInicio} - {sprint.dataFim}
                  </span>
                  <span className="sm:ml-auto">
                    {stats.completed}/{stats.total} tasks
                  </span>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Progresso</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {stats.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sprint.status === 'concluida'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                      }`}
                      style={{ width: `${stats.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSprints.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">
            {projectSprints.length === 0 
              ? 'Nenhuma sprint criada' 
              : 'Nenhuma sprint encontrada'}
          </h3>
          <p className="text-slate-500 dark:text-slate-500">
            {projectSprints.length === 0
              ? userRole === 'editor'
                ? 'Crie sua primeira sprint para começar'
                : 'Aguardando criação de sprints pelo administrador'
              : 'Tente ajustar seus filtros de busca'}
          </p>
          
          {userRole === 'editor' && projectSprints.length === 0 && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 flex items-center gap-2 px-4 py-3 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-all mx-auto min-h-[44px] sm:min-h-0"
            >
              <Plus className="w-4 h-4" />
              Criar Primeira Sprint
            </button>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {filteredSprints.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400">Total</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{filteredSprints.length}</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400">Ativas</div>
              <div className="text-lg font-bold text-green-600">{filteredSprints.filter(s => s.status === 'ativa').length}</div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400">Planejadas</div>
              <div className="text-lg font-bold text-blue-600">{filteredSprints.filter(s => s.status === 'planejada').length}</div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400">Concluídas</div>
              <div className="text-lg font-bold text-purple-600">{filteredSprints.filter(s => s.status === 'concluida').length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSprintsView;