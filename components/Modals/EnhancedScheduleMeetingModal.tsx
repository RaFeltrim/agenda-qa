import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Video, MapPin, Sparkles, AlertTriangle, Send, Link, Flag } from 'lucide-react';
import { Meeting } from '../../types';

interface EnhancedScheduleMeetingModalProps {
  onClose: () => void;
  onSchedule: (meeting: Meeting) => void;
  meetingToEdit?: Meeting | null;
}

const EnhancedScheduleMeetingModal: React.FC<EnhancedScheduleMeetingModalProps> = ({ 
  onClose, 
  onSchedule,
  meetingToEdit 
}) => {
  const [form, setForm] = useState({
    titulo: '',
    horario: '09:00',
    local: 'Google Meet' as 'Google Meet' | 'Teams' | 'Presencial',
    participantes: '',
    pauta: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta',
    linkReuniao: ''
  });

  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<string>('');

  // Load existing meeting data for editing
  useEffect(() => {
    if (meetingToEdit) {
      setForm({
        titulo: meetingToEdit.titulo,
        horario: meetingToEdit.horario,
        local: meetingToEdit.local,
        participantes: meetingToEdit.participantes.join(', '),
        pauta: meetingToEdit.pauta,
        prioridade: meetingToEdit.prioridade || 'media',
        linkReuniao: meetingToEdit.linkReuniao || ''
      });
    }
  }, [meetingToEdit]);

  const generateMeetingLink = () => {
    const platforms = {
      'Google Meet': 'https://meet.google.com/new',
      'Teams': 'https://teams.microsoft.com/l/meeting/new',
      'Presencial': ''
    };
    return platforms[form.local] || '';
  };

  const handleGenerateLink = () => {
    const link = generateMeetingLink();
    if (link) {
      setForm(prev => ({ ...prev, linkReuniao: link }));
      setInviteStatus('Link gerado automaticamente!');
      setTimeout(() => setInviteStatus(''), 2000);
    }
  };

  const sendAutomaticInvites = async () => {
    if (!form.participantes.trim()) {
      setInviteStatus('Adicione participantes primeiro');
      return;
    }

    setIsSendingInvites(true);
    setInviteStatus('Enviando convites...');
    
    try {
      // Simulate API call for sending invites
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const participants = form.participantes.split(',').map(p => p.trim()).filter(p => p);
      setInviteStatus(`✅ Convites enviados para ${participants.length} participante(s)!`);
      
      // Auto-generate meeting link if none exists
      if (!form.linkReuniao && form.local !== 'Presencial') {
        handleGenerateLink();
      }
      
    } catch (error) {
      setInviteStatus('❌ Erro ao enviar convites');
    } finally {
      setIsSendingInvites(false);
      setTimeout(() => setInviteStatus(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;

    const meetingData: any = {
      id: meetingToEdit?.id || Math.random().toString(36).substr(2, 9),
      titulo: form.titulo,
      horario: form.horario,
      pauta: form.pauta || 'Reunião agendada via Agenda Kanban',
      participantes: form.participantes
        .split(',')
        .map(p => p.trim())
        .filter(p => p !== ''),
      local: form.local,
      prioridade: form.prioridade,
      createdAt: meetingToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add optional linkReuniao only if it exists
    if (form.linkReuniao) {
      meetingData.linkReuniao = form.linkReuniao;
    }

    const newMeeting: Meeting = meetingData;

    onSchedule(newMeeting);
  };

  const getPriorityColors = (priority: 'baixa' | 'media' | 'alta') => {
    switch (priority) {
      case 'baixa': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-700/50' };
      case 'media': return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-700/50' };
      case 'alta': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-700/50' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const priorityOptions = [
    { value: 'baixa', label: 'Baixa', icon: '🟢' },
    { value: 'media', label: 'Média', icon: '🟡' },
    { value: 'alta', label: 'Alta', icon: '🔴' }
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black dark:text-white flex items-center gap-2">
              <span className={`p-2 ${meetingToEdit ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'} rounded-xl`}>
                <Calendar className="w-5 h-5" />
              </span>
              {meetingToEdit ? 'Editar Reunião' : 'Nova Reunião'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-1">
              {meetingToEdit ? 'Atualize os detalhes' : 'Agende com inteligência'}
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
          {/* Priority Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Prioridade da Reunião
            </label>
            <div className="grid grid-cols-3 gap-3">
              {priorityOptions.map((option) => {
                const colors = getPriorityColors(option.value as any);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm({ ...form, prioridade: option.value as any })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      form.prioridade === option.value 
                        ? `${colors.bg} ${colors.border} ring-2 ring-offset-2 ring-indigo-500` 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className={`font-black text-sm ${form.prioridade === option.value ? colors.text : 'text-slate-600 dark:text-slate-400'}`}>
                      {option.icon} {option.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title and Agenda */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Título da Reunião *
              </label>
              <input
                required
                autoFocus={!meetingToEdit}
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-base font-semibold focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400/50"
                placeholder="Ex: Daily Sincronização"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Pauta
              </label>
              <input
                value={form.pauta}
                onChange={e => setForm({ ...form, pauta: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-base font-medium focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400/50"
                placeholder="Objetivo da reunião"
              />
            </div>
          </div>

          {/* Time and Platform */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Horário
              </label>
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Plataforma
              </label>
              <div className="relative">
                {form.local === 'Presencial' ? (
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                ) : (
                  <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                )}
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

          {/* Participants */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Participantes (Separe por vírgula)
            </label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={form.participantes}
                onChange={e => setForm({ ...form, participantes: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10"
                placeholder="Rafael, Danyla, Wagner..."
              />
            </div>
            {form.participantes && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={sendAutomaticInvites}
                  disabled={isSendingInvites}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  <Send className="w-3 h-3" />
                  {isSendingInvites ? 'Enviando...' : 'Enviar Convites'}
                </button>
                {inviteStatus && (
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    inviteStatus.includes('✅') ? 'bg-green-100 text-green-800' :
                    inviteStatus.includes('❌') ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {inviteStatus}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Meeting Link */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Link da Reunião
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={form.linkReuniao}
                  onChange={e => setForm({ ...form, linkReuniao: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="https://meet.google.com/..."
                />
              </div>
              {(form.local === 'Google Meet' || form.local === 'Teams') && !form.linkReuniao && (
                <button
                  type="button"
                  onClick={handleGenerateLink}
                  className="px-4 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-sm hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Gerar Link
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 py-4 ${
                meetingToEdit 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
              } rounded-2xl font-black uppercase text-xs tracking-wider shadow-xl transition-all flex items-center justify-center gap-2`}
            >
              {meetingToEdit ? (
                <>
                  <Flag className="w-4 h-4" /> Atualizar
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Agendar Reunião
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedScheduleMeetingModal;