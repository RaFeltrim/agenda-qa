
import React, { useState } from 'react';
import { X, Calendar, Clock, Users, Video, MapPin, Sparkles } from 'lucide-react';
import { Meeting } from '../../types';

interface ScheduleMeetingModalProps {
  onClose: () => void;
  onSchedule: (meeting: Meeting) => void;
}

const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({ onClose, onSchedule }) => {
  const [form, setForm] = useState({
    titulo: '',
    horario: '09:00',
    local: 'Google Meet' as 'Google Meet' | 'Teams' | 'Presencial',
    participantes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;

    const newMeeting: Meeting = {
      id: Math.random().toString(36).substr(2, 9),
      titulo: form.titulo,
      horario: form.horario,
      pauta: 'Agendado via Agenda Kanban',
      local: form.local,
      participantes: form.participantes.split(',').map(p => p.trim()).filter(p => p !== '')
    };

    onSchedule(newMeeting);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black dark:text-white flex items-center gap-2">
              <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Calendar className="w-5 h-5" />
              </span>
              Novo Evento
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-1">Schedule & Sync</p>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título da Reunião</label>
            <input
              required
              autoFocus
              value={form.titulo}
              onChange={e => setForm({ ...form, titulo: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-base font-semibold focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400/50"
              placeholder="Ex: Daily Sincronização"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
                <div className="relative">
                   <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input
                      type="time"
                      value={form.horario}
                      onChange={e => setForm({ ...form, horario: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10"
                   />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plataforma</label>
                <div className="relative">
                   {form.local === 'Presencial' ? <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /> : <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
                   <select
                      value={form.local}
                      onChange={e => setForm({ ...form, local: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 appearance-none"
                   >
                      <option value="Google Meet">Google Meet</option>
                      <option value="Teams">Microsoft Teams</option>
                      <option value="Presencial">Presencial</option>
                   </select>
                </div>
             </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Participantes (Separe por vírgula)</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={form.participantes}
                onChange={e => setForm({ ...form, participantes: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10"
                placeholder="Rafael, Danyla, Wagner..."
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-wider hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Agendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;
