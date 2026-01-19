import React, { useState } from 'react';
import { Folder, Plus, Edit3, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Project } from '../types';

interface ProjectsTabProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onCreateProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  userRole: 'editor' | 'viewer' | null;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  userRole
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    nome: '',
    descricao: '',
    cor: '#3b82f6',
    squadLead: ''
  });

  // Team members for squad lead selection
  const teamMembers = [
    'Luiz Muller',
    'Rafael Feltrim', 
    'Wagner Silva',
    'Danyla Andrade',
    'Marcelo Cordeiro',
    'Fernanda Custódio',
    'João Paulo',
    'Maria Neves'
  ];

  const handleCreateProject = () => {
    if (!newProject.nome.trim()) return;
    
    onCreateProject({
      nome: newProject.nome.trim(),
      descricao: newProject.descricao.trim(),
      cor: newProject.cor,
      ...(newProject.squadLead && { squadLead: newProject.squadLead })
    });
    
    setNewProject({ nome: '', descricao: '', cor: '#3b82f6', squadLead: '' });
    setShowCreateForm(false);
  };

  const handleUpdateProject = () => {
    if (editingProject && editingProject.nome.trim()) {
      onUpdateProject(editingProject);
      setEditingProject(null);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      onDeleteProject(projectId);
      if (selectedProjectId === projectId) {
        onSelectProject(null);
      }
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      '#3b82f6': 'bg-blue-500',
      '#10b981': 'bg-emerald-500',
      '#f59e0b': 'bg-amber-500',
      '#ef4444': 'bg-red-500',
      '#8b5cf6': 'bg-violet-500',
      '#ec4899': 'bg-pink-500',
      '#06b6d4': 'bg-cyan-500',
      '#84cc16': 'bg-lime-500'
    };
    
    return colorMap[color] || 'bg-blue-500';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-black dark:text-white flex items-center gap-2">
          <Folder className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Projetos
        </h2>
        
        {userRole === 'editor' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all w-full sm:w-auto min-h-[44px] sm:min-h-0"
          >
            <Plus className="w-4 h-4" />
            Novo Projeto
          </button>
        )}
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">Criar Novo Projeto</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nome do projeto
              </label>
              <input
                type="text"
                placeholder="Nome do projeto"
                value={newProject.nome}
                onChange={(e) => setNewProject({...newProject, nome: e.target.value})}
                className="w-full px-3 py-3 sm:py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Descrição
              </label>
              <textarea
                placeholder="Descrição do projeto"
                value={newProject.descricao}
                onChange={(e) => setNewProject({...newProject, descricao: e.target.value})}
                className="w-full px-3 py-3 sm:py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none min-h-[88px]"
                rows={3}
              />
            </div>
            
            {/* Squad Lead Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Squad Lead
              </label>
              <select
                value={newProject.squadLead}
                onChange={(e) => setNewProject({...newProject, squadLead: e.target.value})}
                className="w-full px-3 py-3 sm:py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[44px]"
              >
                <option value="">Selecione o Squad Lead</option>
                {teamMembers.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Cor:
              </label>
              <input
                type="color"
                value={newProject.cor}
                onChange={(e) => setNewProject({...newProject, cor: e.target.value})}
                className="w-10 h-10 rounded cursor-pointer border border-slate-300 dark:border-slate-600"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {newProject.cor}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleCreateProject}
                disabled={!newProject.nome.trim()}
                className="px-4 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm transition-all flex-1 min-h-[44px] sm:min-h-0"
              >
                Criar Projeto
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewProject({ nome: '', descricao: '', cor: '#3b82f6', squadLead: '' });
                }}
                className="px-4 py-3 sm:py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-sm transition-all flex-1 min-h-[44px] sm:min-h-0"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Form */}
      {editingProject && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3">Editar Projeto</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nome do projeto
              </label>
              <input
                type="text"
                placeholder="Nome do projeto"
                value={editingProject.nome}
                onChange={(e) => setEditingProject({...editingProject, nome: e.target.value})}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Descrição
              </label>
              <textarea
                placeholder="Descrição do projeto"
                value={editingProject.descricao}
                onChange={(e) => setEditingProject({...editingProject, descricao: e.target.value})}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                rows={3}
              />
            </div>
            
            {/* Squad Lead Selection for Edit */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Squad Lead
              </label>
              <select
                value={editingProject.squadLead || ''}
                onChange={(e) => setEditingProject({...editingProject, squadLead: e.target.value})}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Selecione o Squad Lead</option>
                {teamMembers.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Cor:
              </label>
              <input
                type="color"
                value={editingProject.cor}
                onChange={(e) => setEditingProject({...editingProject, cor: e.target.value})}
                className="w-10 h-10 rounded cursor-pointer border border-slate-300 dark:border-slate-600"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {editingProject.cor}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleUpdateProject}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-all flex-1"
              >
                Salvar Alterações
              </button>
              <button
                onClick={() => setEditingProject(null)}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-sm transition-all flex-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-3">
        {/* All Projects Option */}
        <div
          onClick={() => onSelectProject(null)}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedProjectId === null
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
              : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${selectedProjectId === null ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
              <div className="min-w-0 flex-1">
                <h3 className={`font-bold truncate ${
                  selectedProjectId === null 
                    ? 'text-indigo-700 dark:text-indigo-300' 
                    : 'text-slate-800 dark:text-slate-200'
                }`}>
                  Todos os Projetos
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                  Visualizar todas as sprints de todos os projetos
                </p>
              </div>
            </div>
            {selectedProjectId === null && (
              <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 ml-2" />
            )}
          </div>
        </div>

        {projects.map((project) => (
          <div
            key={project.id}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative group ${
              selectedProjectId === project.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div 
                className="flex items-start gap-3 flex-1 min-w-0"
                onClick={() => onSelectProject(project.id)}
              >
                <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${getColorClasses(project.cor)}`}></div>
                <div className="min-w-0 flex-1">
                  <h3 className={`font-bold truncate ${
                    selectedProjectId === project.id 
                      ? 'text-indigo-700 dark:text-indigo-300' 
                      : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {project.nome}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {project.descricao}
                  </p>
                </div>
              </div>
              
              {userRole === 'editor' && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Use setTimeout to prevent blocking the UI thread
                      setTimeout(() => {
                        setEditingProject(project);
                      }, 0);
                    }}
                    className="p-2 sm:p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Editar projeto"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className="p-2 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Excluir projeto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {selectedProjectId === project.id && (
                <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              )}
            </div>
            
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 truncate">
                  Criado em {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                </span>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                  selectedProjectId === project.id
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {selectedProjectId === project.id ? 'ATIVO' : 'INATIVO'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-8">
            <Folder className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-600 dark:text-slate-400 mb-1">
              Nenhum projeto criado
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              {userRole === 'editor' 
                ? 'Crie seu primeiro projeto para organizar suas sprints' 
                : 'Aguardando criação de projetos pelo administrador'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsTab;