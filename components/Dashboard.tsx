import React from 'react';
import { Card, Sprint, Meeting } from '../types';
import {
  LayoutGrid,
  Clock,
  AlertCircle,
  BarChart3,
  ChevronDown,
  Target,
  PieChart,
  Video,
  CalendarPlus,
  X,
  ExternalLink,
} from 'lucide-react';

interface DashboardProps {
  cards: Card[];
  sprints: Sprint[];
  meetings: Meeting[];
  onFilterChange: (filter: any) => void;
  activeFilter: string;
  activeSprintId: string | null;
  onOpenSprintList: () => void;
  onFinishSprint: () => void;
  onOpenPerformance: () => void;
  onOpenScheduleModal: () => void;
  onDeleteMeeting: (id: string) => void;
  onDeleteExpiredCards?: (() => void) | undefined; // New prop for expired card cleanup
}

const Dashboard: React.FC<DashboardProps> = ({
  cards,
  sprints,
  meetings,
  onFilterChange,
  activeFilter,
  activeSprintId,
  onOpenSprintList,
  onOpenPerformance,
  onOpenScheduleModal,
  onDeleteMeeting,
  onDeleteExpiredCards,
}) => {
  const currentSprint = sprints.find(s => s.id === activeSprintId);

  const stats = [
    {
      label: 'Total Cards',
      val: cards.filter(c => !activeSprintId || c.sprintId === activeSprintId).length,
      icon: LayoutGrid,
      color: 'text-indigo-600',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      label: 'Ativos',
      val: cards.filter(c => c.status === 'em-progresso').length,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Bloqueios',
      val: cards.filter(c => c.status === 'bloqueado').length,
      icon: AlertCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
    },
    {
      label: 'Entregues',
      val: cards.filter(c => c.status === 'concluido').length,
      icon: BarChart3,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8 mb-10">
        <div className="flex-1 space-y-6">
          {/* Sprint Selector & Performance */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenSprintList}
              className="group flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm hover:border-indigo-400 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1.5 tracking-widest">
                  Ciclo Atual
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[180px]">
                    {currentSprint ? currentSprint.nome : 'Todos os Ciclos'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
                </div>
              </div>
            </button>

            <button
              onClick={onOpenPerformance}
              className="flex items-center gap-2.5 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all text-sm font-black uppercase tracking-tight dark:text-white group"
            >
              <PieChart className="w-5 h-5 text-indigo-500 group-hover:rotate-12 transition-transform" />
              Analytics
            </button>

            {/* Cleanup Expired Cards Button */}
            {onDeleteExpiredCards && (
              <button
                onClick={onDeleteExpiredCards}
                className="flex items-center gap-2.5 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm hover:text-red-600 hover:border-red-200 dark:hover:border-red-900 transition-all text-sm font-black uppercase tracking-tight dark:text-white group"
              >
                <AlertCircle className="w-5 h-5 text-red-500 group-hover:animate-pulse transition-transform" />
                Limpar Vencidos
              </button>
            )}
          </div>

          {/* New Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map((s, i) => (
              <div
                key={i}
                className={`bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 ${s.border} dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group`}
              >
                <div
                  className={`${s.bg} w-10 h-10 rounded-xl flex items-center justify-center ${s.color} mb-3 group-hover:scale-110 transition-transform`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black dark:text-white tracking-tighter">{s.val}</p>
                  <span className="text-[10px] text-slate-400 font-bold">unit</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Meeting Widget Redesign */}
        <div className="lg:w-[400px] bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-7 text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 p-12 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <Video className="w-48 h-48" />
          </div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="font-black uppercase tracking-tight text-xl leading-none">Schedule</h3>
              <p className="text-indigo-200 text-xs font-bold mt-1 uppercase tracking-[0.2em] opacity-80">
                Timeline do dia
              </p>
            </div>
            <button
              onClick={onOpenScheduleModal}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all active:scale-95 shadow-lg"
              title="Agendar nova reunião"
            >
              <CalendarPlus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 relative z-10 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {meetings.length === 0 ? (
              <div className="py-12 text-center opacity-60 italic text-sm font-medium">
                <p>Nenhuma reunião agendada.</p>
                <p className="text-xs mt-1">Clique em + para adicionar.</p>
              </div>
            ) : (
              meetings.map(m => (
                <div
                  key={m.id}
                  onClick={() => {
                    if (m.linkReuniao) {
                      window.open(m.linkReuniao, '_blank');
                    }
                  }}
                  className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/10 hover:bg-white/20 transition-all cursor-pointer group/item relative"
                >
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteMeeting(m.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-xl opacity-0 group-hover/item:opacity-100 transition-all scale-90 hover:scale-100"
                    title="Remover evento"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black bg-indigo-500 text-white px-3 py-1 rounded-full shadow-lg">
                      {m.horario}
                    </span>
                    <div className="flex items-center gap-1.5 text-indigo-200">
                      {m.linkReuniao && (
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-300" />
                      )}
                      <Video className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {m.local}
                      </span>
                    </div>
                  </div>
                  <p className="text-base font-black truncate mb-3 group-hover/item:text-indigo-100 transition-colors pr-6">
                    {m.titulo}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2.5">
                      {m.participantes.slice(0, 3).map((p, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-xl border-2 border-indigo-700 bg-indigo-500 flex items-center justify-center text-[10px] font-black shadow-md uppercase"
                        >
                          {p[0]}
                        </div>
                      ))}
                      {m.participantes.length > 3 && (
                        <div className="w-8 h-8 rounded-xl border-2 border-indigo-700 bg-indigo-400/50 flex items-center justify-center text-[10px] font-black">
                          +{m.participantes.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar Redesign */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 p-5 bg-white/50 dark:bg-slate-800/50 glass rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-[1.25rem] gap-1 shadow-inner">
          {['todas', 'minhas', 'vencidas', 'em-progresso'].map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeFilter === f
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md scale-100'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 px-4 py-2 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] leading-none mb-1">
              Squad Lead
            </p>
            <p className="text-sm font-black text-slate-800 dark:text-white">Luiz Muller</p>
          </div>
          <div className="relative">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Luiz"
              className="w-11 h-11 rounded-2xl shadow-xl border-2 border-white dark:border-slate-700 object-cover"
              alt="Profile"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
