import React, { useState } from 'react';
import { Plus, Filter, Calendar, Clock, Users, Video, AlertTriangle } from 'lucide-react';
import { Meeting } from '../../types';
import MeetingCard from './MeetingCard';
import EnhancedScheduleMeetingModal from '../Modals/EnhancedScheduleMeetingModal';

interface MeetingsDashboardProps {
  meetings: Meeting[];
  onAddMeeting: (meeting: Meeting) => void;
  onUpdateMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (id: string) => void;
}

const MeetingsDashboard: React.FC<MeetingsDashboardProps> = ({
  meetings,
  onAddMeeting,
  onUpdateMeeting,
  onDeleteMeeting
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [filter, setFilter] = useState<'todas' | 'hoje' | 'urgentes' | 'proximas'>('todas');

  const handleScheduleMeeting = (meeting: Meeting) => {
    onAddMeeting(meeting);
    setShowScheduleModal(false);
  };

  const handleUpdateMeeting = (meeting: Meeting) => {
    onUpdateMeeting(meeting);
    setEditingMeeting(null);
  };

  const handleDeleteMeeting = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta reunião?')) {
      onDeleteMeeting(id);
    }
  };

  const handleJoinMeeting = (link: string) => {
    window.open(link, '_blank');
  };

  const filteredMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(`2000-01-01T${meeting.horario}`);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'hoje':
        // For demo purposes, show all meetings
        return true;
      case 'urgentes':
        return meeting.prioridade === 'alta';
      case 'proximas':
        return meetingDate > now;
      default:
        return true;
    }
  });

  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    return a.horario.localeCompare(b.horario);
  });

  const getPriorityStats = () => {
    const stats = {
      alta: meetings.filter(m => m.prioridade === 'alta').length,
      media: meetings.filter(m => m.prioridade === 'media').length,
      baixa: meetings.filter(m => m.prioridade === 'baixa').length
    };
    
    return stats;
  };

  const priorityStats = getPriorityStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Calendar className="w-7 h-7 text-indigo-600" />
            Reuniões
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gerencie suas reuniões e acompanhe compromissos importantes
          </p>
        </div>
        
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Nova Reunião
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-red-700 dark:text-red-400">{priorityStats.alta}</p>
              <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Urgentes</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-yellow-700 dark:text-yellow-400">{priorityStats.media}</p>
              <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">Média</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Video className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-green-700 dark:text-green-400">{priorityStats.baixa}</p>
              <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Baixa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'todas', label: 'Todas', icon: Calendar },
          { key: 'hoje', label: 'Hoje', icon: Clock },
          { key: 'urgentes', label: 'Urgentes', icon: AlertTriangle },
          { key: 'proximas', label: 'Próximas', icon: Users }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === key
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Meetings Grid */}
      {sortedMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMeetings.map((meeting, index) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onEdit={setEditingMeeting}
              onDelete={handleDeleteMeeting}
              onJoinMeeting={handleJoinMeeting}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">
            Nenhuma reunião encontrada
          </h3>
          <p className="text-slate-500 dark:text-slate-500">
            {filter === 'todas' 
              ? 'Comece agendando sua primeira reunião' 
              : `Nenhuma reunião ${filter} encontrada`}
          </p>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            Agendar Reunião
          </button>
        </div>
      )}

      {/* Modals */}
      {showScheduleModal && (
        <EnhancedScheduleMeetingModal
          onClose={() => setShowScheduleModal(false)}
          onSchedule={handleScheduleMeeting}
        />
      )}
      
      {editingMeeting && (
        <EnhancedScheduleMeetingModal
          onClose={() => setEditingMeeting(null)}
          onSchedule={handleUpdateMeeting}
          meetingToEdit={editingMeeting}
        />
      )}
    </div>
  );
};

export default MeetingsDashboard;