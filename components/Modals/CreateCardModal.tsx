import React, { useState } from 'react';
import { X, Plus, Calendar, User, Tag, AlignLeft, Sparkles } from 'lucide-react';
import { Card, CardStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { formatDateForInput, parseDateFromInput } from '../../utils/dateUtils';

interface CreateCardModalProps {
  onClose: () => void;
  onCreate: (card: Card) => void;
  initialStatus?: CardStatus;
  activeSprintId?: string | null;
}

const CreateCardModal: React.FC<CreateCardModalProps> = ({
  onClose,
  onCreate,
  initialStatus = 'backlog',
  activeSprintId,
}) => {
  const { profile } = useAuth();
  const currentUser = profile?.full_name || 'Usuário';
  
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    responsavel: currentUser,
    prazo: formatDateForInput(new Date()),
    tags: '',
  });

  // Ensure form values are never undefined
  const safeForm = {
    titulo: form.titulo || '',
    descricao: form.descricao || '',
    responsavel: form.responsavel || currentUser,
    prazo: form.prazo || formatDateForInput(new Date()),
    tags: form.tags || '',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;

    const newCard: Card = {
      id: Math.random().toString(36).substr(2, 9),
      titulo: safeForm.titulo,
      descricao: safeForm.descricao,
      responsavel: safeForm.responsavel,
      prazo: safeForm.prazo || formatDateForInput(new Date()),
      status: initialStatus as CardStatus,
      tags: safeForm.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t !== ''),
      dataCriacao: new Date().toISOString(),
      dataCriacaoPor: currentUser,
      comentarios: [],
      anexos: [],
      historico: [
        { acao: 'Card criado manualmente', por: currentUser, em: new Date().toISOString() },
      ],
      subTasks: [],
    };

    // Add sprintId only if active sprint exists
    if (activeSprintId) {
      newCard.sprintId = activeSprintId;
    }

    onCreate(newCard);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        {/* Header Visual */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black dark:text-white flex items-center gap-2">
              <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Plus className="w-5 h-5" />
              </span>
              Nova Tarefa
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-1">
              Adicionar ao Backlog
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Título da Tarefa
            </label>
            <input
              required
              autoFocus
              value={form.titulo}
              onChange={e => setForm({ ...form, titulo: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-base font-semibold text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400/50 transition-all"
              placeholder="Ex: Implementar Autenticação OAuth"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Contexto & Detalhes
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
              <textarea
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-11 pr-4 py-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 h-32 resize-none leading-relaxed"
                placeholder="Descreva os requisitos técnicos..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Responsável
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  value={form.responsavel}
                  onChange={e => setForm({ ...form, responsavel: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Deadline
              </label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="date"
                  value={form.prazo}
                  onChange={e => setForm({ ...form, prazo: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Tags (Separadas por vírgula)
            </label>
            <div className="relative group">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all"
                placeholder="Ex: Backend, API, Urgente"
              />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase text-xs tracking-wider"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-wider hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Criar Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCardModal;
