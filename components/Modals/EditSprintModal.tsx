import React, { useState, useEffect } from 'react';
import { X, Save, Archive, Calendar, Target, Edit3, Flag } from 'lucide-react';
import { Sprint } from '../../types';

interface EditSprintModalProps {
  sprint: Sprint;
  onClose: () => void;
  onSave: (updatedSprint: Sprint) => void;
  onArchive: (sprintId: string) => void;
  userRole?: 'editor' | 'viewer' | null;
}

const EditSprintModal: React.FC<EditSprintModalProps> = ({
  sprint,
  onClose,
  onSave,
  onArchive,
  userRole
}) => {
  const [formData, setFormData] = useState({
    nome: sprint.nome,
    objetivo: sprint.objetivo || '',
    dataInicio: sprint.dataInicio,
    dataFim: sprint.dataFim,
    status: sprint.status
  });
  
  const [isArchiving, setIsArchiving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form only when specific fields change to avoid infinite loops
  useEffect(() => {
    const timer = setTimeout(() => {
      validateForm();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [formData.nome, formData.dataInicio, formData.dataFim]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da sprint é obrigatório';
    }
    
    if (formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }
    
    if (new Date(formData.dataFim) <= new Date(formData.dataInicio)) {
      newErrors.datas = 'Data de término deve ser posterior à data de início';
    }
    
    // Check if dates are too far in the past/future
    const startDate = new Date(formData.dataInicio);
    const endDate = new Date(formData.dataFim);
    const today = new Date();
    const maxFutureDate = new Date();
    maxFutureDate.setMonth(today.getMonth() + 12); // Max 1 year in future
    
    if (startDate < new Date(today.setFullYear(today.getFullYear() - 1))) {
      newErrors.datas = 'Data de início não pode ser mais de 1 ano no passado';
    }
    
    if (endDate > maxFutureDate) {
      newErrors.datas = 'Data de término não pode ser mais de 1 ano no futuro';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const updatedSprint: Sprint = {
      ...sprint,
      ...formData,
      updatedAt: new Date().toISOString()
    };
    
    onSave(updatedSprint);
  };

  const handleArchive = () => {
    if (window.confirm(`Tem certeza que deseja arquivar a sprint "${sprint.nome}"?\n\nEsta ação moverá todas as tarefas não concluídas para o backlog.`)) {
      setIsArchiving(true);
      onArchive(sprint.id);
    }
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

  const canEdit = userRole === 'editor';
  const isCompleted = sprint.status === 'concluida';
  const isArchived = sprint.status === 'arquivada';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/10">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900">
          <div>
            <h2 className="text-2xl font-black dark:text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Edit3 className="w-6 h-6" />
              </div>
              Editar Sprint
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black ${getStatusColor(sprint.status)}`}>
                {getStatusLabel(sprint.status)}
              </span>
              <p className="text-sm text-slate-500 font-medium truncate max-w-xs">
                {sprint.nome}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Sprint Name */}
          <div>
            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">
              Nome da Sprint *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              disabled={!canEdit || isArchived}
              className={`w-full px-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                errors.nome 
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
              } ${
                canEdit && !isArchived 
                  ? 'hover:border-indigo-300 dark:hover:border-indigo-700' 
                  : 'opacity-70 cursor-not-allowed'
              } text-slate-900 dark:text-white font-medium`}
              placeholder="Ex: Sprint 04 - Refatoração do Backend"
            />
            {errors.nome && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-bold">{errors.nome}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Início
              </label>
              <input
                type="date"
                value={formData.dataInicio}
                onChange={(e) => handleChange('dataInicio', e.target.value)}
                disabled={!canEdit || isArchived || isCompleted}
                className={`w-full px-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                  errors.datas 
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                } ${
                  canEdit && !isArchived && !isCompleted
                    ? 'hover:border-indigo-300 dark:hover:border-indigo-700' 
                    : 'opacity-70 cursor-not-allowed'
                } text-slate-900 dark:text-white font-medium`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Término
              </label>
              <input
                type="date"
                value={formData.dataFim}
                onChange={(e) => handleChange('dataFim', e.target.value)}
                disabled={!canEdit || isArchived || isCompleted}
                className={`w-full px-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                  errors.datas 
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                } ${
                  canEdit && !isArchived && !isCompleted
                    ? 'hover:border-indigo-300 dark:hover:border-indigo-700' 
                    : 'opacity-70 cursor-not-allowed'
                } text-slate-900 dark:text-white font-medium`}
              />
            </div>
          </div>
          
          {errors.datas && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
              <p className="text-sm text-rose-700 dark:text-rose-300 font-bold flex items-center gap-2">
                <Flag className="w-4 h-4" />
                {errors.datas}
              </p>
            </div>
          )}

          {/* Goal/Objective */}
          <div>
            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4" />
              Objetivo / Meta
            </label>
            <textarea
              value={formData.objetivo}
              onChange={(e) => handleChange('objetivo', e.target.value)}
              disabled={!canEdit || isArchived}
              rows={3}
              className={`w-full px-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none ${
                errors.objetivo 
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
              } ${
                canEdit && !isArchived
                  ? 'hover:border-indigo-300 dark:hover:border-indigo-700' 
                  : 'opacity-70 cursor-not-allowed'
              } text-slate-900 dark:text-white font-medium`}
              placeholder="Descreva os objetivos e metas desta sprint..."
            />
          </div>

          {/* Status Selection (only for editors) */}
          {canEdit && !isArchived && (
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">
                Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['planejada', 'ativa', 'concluida', 'arquivada'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleChange('status', status)}
                    disabled={isCompleted && status !== 'concluida'}
                    className={`p-3 rounded-xl border-2 text-sm font-black uppercase tracking-widest transition-all ${
                      formData.status === status
                        ? `${getStatusColor(status)} border-current scale-105`
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                    } ${
                      isCompleted && status !== 'concluida' 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'cursor-pointer'
                    }`}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3">
          {!isArchived && (
            <>
              {canEdit ? (
                <>
                  <button
                    onClick={handleArchive}
                    disabled={isArchiving || isCompleted}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${
                      isArchiving || isCompleted
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-rose-600 hover:bg-rose-700 text-white hover:scale-105 active:scale-95'
                    }`}
                  >
                    <Archive className="w-4 h-4" />
                    {isArchiving ? 'Arquivando...' : 'Arquivar Sprint'}
                  </button>
                  
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={Object.keys(errors).length > 0 || isArchiving}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${
                      Object.keys(errors).length > 0 || isArchiving
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Salvar Alterações
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                >
                  Fechar
                </button>
              )}
            </>
          )}
          
          {isArchived && (
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditSprintModal;