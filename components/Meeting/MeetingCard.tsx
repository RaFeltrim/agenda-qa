import React from 'react';
import { motion } from 'framer-motion';
import { Video, MapPin, Users, Clock, AlertTriangle, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Meeting } from '../../types';

interface MeetingCardProps {
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  onDelete: (id: string) => void;
  onJoinMeeting?: (link: string) => void;
  index?: number;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ 
  meeting, 
  onEdit, 
  onDelete, 
  onJoinMeeting,
  index = 0 
}) => {
  const getPriorityConfig = () => {
    switch (meeting.prioridade) {
      case 'baixa':
        return {
          tag: 'BAIXA',
          tagClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          borderClass: 'border-green-200 dark:border-green-700/50',
          glowClass: 'shadow-green-500/20'
        };
      case 'media':
        return {
          tag: 'MÉDIA',
          tagClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          borderClass: 'border-yellow-200 dark:border-yellow-700/50',
          glowClass: 'shadow-yellow-500/20'
        };
      case 'alta':
        return {
          tag: 'URGENTE',
          tagClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
          borderClass: 'border-red-200 dark:border-red-700/50',
          glowClass: 'shadow-red-500/20'
        };
      default:
        return {
          tag: 'MÉDIA',
          tagClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          borderClass: 'border-yellow-200 dark:border-yellow-700/50',
          glowClass: 'shadow-yellow-500/20'
        };
    }
  };

  const priorityConfig = getPriorityConfig();

  const handleJoinMeeting = () => {
    if (meeting.linkReuniao && onJoinMeeting) {
      onJoinMeeting(meeting.linkReuniao);
    } else if (meeting.linkReuniao) {
      window.open(meeting.linkReuniao, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative bg-white dark:bg-slate-800 rounded-[2rem] border-2 p-6 cursor-pointer select-none shadow-sm ${
        meeting.prioridade === 'alta' 
          ? 'border-red-300 dark:border-red-700/50 shadow-lg' 
          : priorityConfig.borderClass
      } hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300`}
    >
      {/* Priority Glow Effect for High Priority */}
      {meeting.prioridade === 'alta' && (
        <div className="absolute inset-0 bg-red-500/5 rounded-[2rem] -z-10 group-hover:bg-red-500/10 transition-colors animate-pulse"></div>
      )}

      {/* Header with Priority Tag */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-wrap gap-1.5">
          <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${priorityConfig.tagClass} border ${priorityConfig.borderClass.replace('border-', 'border-')}`}>
            {priorityConfig.tag}
          </span>
          <span className="px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-600/50">
            {meeting.local === 'Presencial' ? 'Presencial' : 'Online'}
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(meeting);
            }}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(meeting.id);
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meeting Title */}
      <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
        {meeting.titulo}
      </h3>

      {/* Agenda */}
      {meeting.pauta && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity">
          {meeting.pauta}
        </p>
      )}

      {/* Meeting Details */}
      <div className="space-y-3">
        {/* Time */}
        <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 dark:text-slate-400">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>{meeting.horario}</span>
        </div>

        {/* Participants */}
        <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 dark:text-slate-400">
          <Users className="w-4 h-4 text-indigo-500" />
          <span>{meeting.participantes.length} participante{meeting.participantes.length !== 1 ? 's' : ''}</span>
          <span className="text-slate-400 font-medium">({meeting.participantes.slice(0, 2).join(', ')})</span>
        </div>

        {/* Location/Platform */}
        <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 dark:text-slate-400">
          {meeting.local === 'Presencial' ? (
            <MapPin className="w-4 h-4 text-indigo-500" />
          ) : (
            <Video className="w-4 h-4 text-indigo-500" />
          )}
          <span>{meeting.local}</span>
        </div>
      </div>

      {/* Join Meeting Button */}
      {meeting.linkReuniao && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
          <button
            onClick={handleJoinMeeting}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <ExternalLink className="w-4 h-4" />
            Entrar na Reunião
          </button>
        </div>
      )}

      {/* Urgency Warning for High Priority */}
      {meeting.prioridade === 'alta' && (
        <div className="mt-3 flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700/50">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-wider">
            Reunião de alta prioridade - presença obrigatória
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default MeetingCard;