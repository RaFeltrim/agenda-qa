import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '../../types';
import { Calendar, MessageSquare, Paperclip, CheckSquare, AlertCircle, Clock, Copy, Archive, ExternalLink, Star, Flag } from 'lucide-react';
import { getPrazoColor } from '../../utils/dateUtils';
import EllipsisMenu from '../Common/EllipsisMenu';

interface CardProps {
  card: CardType;
  onClick: (card: CardType) => void;
  userRole?: 'editor' | 'viewer' | null;
  onDuplicate?: (card: CardType) => void;
  onArchive?: (cardId: string) => void;
  onCopyLink?: (cardId: string) => void;
  onToggleFavorite?: (cardId: string) => void;
  onFlagUrgent?: (cardId: string) => void;
}

const Card: React.FC<CardProps & { index?: number }> = ({ 
  card, 
  onClick, 
  userRole,
  onDuplicate,
  onArchive,
  onCopyLink,
  onToggleFavorite,
  onFlagUrgent,
  index = 0 
}) => {
  const totalSubtasks = card.subTasks?.length || 0;
  const completedSubtasks = card.subTasks?.filter(st => st.concluida).length || 0;
  const progressPercent =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  const isBlocked = card.status === 'bloqueado';
  const isUrgent = card.urgente;
  
  // Calculate if card is actually overdue
  const today = new Date();
  const deadline = new Date(card.prazo);
  const isSameDay = deadline.toDateString() === today.toDateString();
  const isPastDeadline = deadline < today;
  const isBusinessHoursOver = today.getHours() >= 18;
  const isActuallyOverdue = isPastDeadline && (!isSameDay || isBusinessHoursOver);
  const isOverdueCard = isActuallyOverdue && card.status !== 'concluido';

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
      onClick={() => onClick(card)}
      className={`group relative bg-white dark:bg-slate-800 rounded-[2rem] border-2 p-6 cursor-pointer select-none shadow-sm transition-all duration-300 ${isOverdueCard 
        ? 'border-red-200 dark:border-red-900/40 hover:border-red-400 bg-red-50/30 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20' 
        : isBlocked || isUrgent 
          ? 'border-rose-100 dark:border-rose-900/30 hover:border-rose-400' 
          : 'border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600'
      }`}
    >


      {/* Header Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap gap-1.5">
          {card.tags.slice(0, 1).map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-600/50"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <h3
        className={`text-base font-black text-slate-900 dark:text-slate-100 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight ${isBlocked || isUrgent ? 'text-rose-700 dark:text-rose-400' : ''}`}
      >
        {card.titulo}
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity">
        {card.descricao}
      </p>

      {/* Progress Bar Section */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>Progress</span>
          </div>
          <span className="text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-900/50 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm bg-gradient-to-r from-indigo-600 to-violet-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] font-black text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span>{card.comentarios.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Overdue indicator - positioned prominently */}
          {isOverdueCard && (
            <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-500/40 animate-pulse border-2 border-red-400/80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0 drop-shadow-sm" />
              <span className="whitespace-nowrap drop-shadow-sm">VENCIDO</span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5">
            <span
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight border shadow-sm flex items-center gap-2 transition-all duration-300 ${getPrazoColor(card.prazo)}`}
            >
              <Clock className="w-3.5 h-3.5" />
              {card.prazo}
            </span>
          </div>
          
          <div className="relative group/avatar ml-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-[10px] font-black shadow-md shadow-indigo-500/20 ring-2 ring-white dark:ring-slate-800 transition-all group-hover/avatar:scale-105">
              {card.responsavel
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
