import React, { useState } from 'react';
import { X, Target, Calendar, Plus, Flag } from 'lucide-react';
import { Sprint } from '../../types';

interface CreateSprintModalProps {
  onClose: () => void;
  onCreate: (sprint: Sprint) => void;
}

const CreateSprintModal: React.FC<CreateSprintModalProps> = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({
    nome: '',
    objetivo: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'planejada' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return;

    const newSprint: Sprint = {
      id: `sprint-${Math.random().toString(36).substr(2, 5)}`,
      ...form,
    };

    onCreate(newSprint);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/10">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black dark:text-white flex items-center gap-2">
              <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Target className="w-5 h-5" />
              </span>
              Nova Sprint
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-1">
              Ciclo de 14 Dias
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Identificação
            </label>
            <input
              required
              autoFocus
              value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-base font-semibold focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400/50"
              placeholder="Ex: Sprint 04 - Refatoração"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Objetivo Principal
            </label>
            <div className="relative">
              <Flag className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
              <textarea
                required
                value={form.objetivo}
                onChange={e => setForm({ ...form, objetivo: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-11 pr-4 py-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 h-24 resize-none leading-relaxed"
                placeholder="Qual a meta deste ciclo?"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Início
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={form.dataInicio}
                  onChange={e => setForm({ ...form, dataInicio: e.target.value })}
                  className="w-full pl-11 pr-3 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Término
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={form.dataFim}
                  onChange={e => setForm({ ...form, dataFim: e.target.value })}
                  className="w-full pl-11 pr-3 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-wider hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSprintModal;
