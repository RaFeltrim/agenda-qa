import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '../../types';
import { MessageSquare, CheckSquare, AlertCircle, Clock } from 'lucide-react';
import { getPrazoColor } from '../../utils/dateUtils';
// EllipsisMenu removed
import { hasUnreadComments } from '../../services/commentReadService';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../UserAvatar';

interface CardProps {
  card: CardType;
  onClick: (card: CardType) => void;
  userRole?: 'editor' | 'viewer' | null;
}

const Card: React.FC<CardProps & { index?: number }> = ({
  card,
  onClick,
  index = 0
}) => {
  const { profile } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);

  const totalSubtasks = card.subTasks?.length || 0;
  const completedSubtasks = card.subTasks?.filter(st => st.concluida).length || 0;
  const progressPercent =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  const isBlocked = card.status === 'bloqueado';
  const isUrgent = card.urgente;

  // Check for unread comments when component mounts
  useEffect(() => {
    const checkUnreadComments = async () => {
      if (profile?.id && card.id) {
        const unread = await hasUnreadComments(card.id, profile.id);
        setHasUnread(unread);
      }
    };

    checkUnreadComments();
  }, [card.id, profile?.id, card.comentarios.length]);

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
      className={`group relative bg-white dark:bg-slate-800 rounded-[2rem] border-2 p-6 cursor-pointer select-none shadow-sm transition-all duration-300 ${hasUnread
        ? 'border-yellow-400 dark:border-yellow-500 hover:border-yellow-500 bg-yellow-50/40 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 shadow-lg shadow-yellow-200/50 dark:shadow-yellow-900/20 animate-pulse'
        : isBlocked || isUrgent
          ? 'border-red-600 dark:border-red-500 hover:border-red-700 bg-red-100/60 dark:bg-red-900/40 hover:bg-red-200/60 dark:hover:bg-red-900/50 shadow-lg shadow-red-300/40 dark:shadow-red-900/40 ring-2 ring-red-200/50 dark:ring-red-900/30'
          : isOverdueCard
            ? 'border-orange-500 dark:border-orange-400 hover:border-orange-600 bg-orange-50/40 dark:bg-orange-900/30 hover:bg-orange-100/50 dark:hover:bg-orange-900/40 shadow-md shadow-orange-200/40 dark:shadow-orange-900/30'
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
        className={`text-base font-black text-slate-900 dark:text-slate-100 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight ${isBlocked || isUrgent
          ? 'text-red-800 dark:text-red-300 font-extrabold drop-shadow-sm'
          : ''
          }`}
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

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] font-black text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span>{card.comentarios.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Indicators */}
          {((isBlocked || isUrgent) && isOverdueCard) ? (
            <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-500/40 animate-pulse border-2 border-red-400/80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0 drop-shadow-sm" />
              <span className="whitespace-nowrap drop-shadow-sm">
                {isBlocked ? 'BLOQ/VENC' : 'URG/VENC'}
              </span>
            </div>
          ) : (
            <>
              {(isBlocked || isUrgent) && (
                <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-500/40 animate-pulse border-2 border-red-400/80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 drop-shadow-sm" />
                  <span className="whitespace-nowrap drop-shadow-sm">{isBlocked ? 'BLOQUEADO' : 'URGENTE'}</span>
                </div>
              )}

              {isOverdueCard && (
                <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/40 animate-pulse border-2 border-orange-400/80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 drop-shadow-sm" />
                  <span className="whitespace-nowrap drop-shadow-sm">VENCIDO</span>
                </div>
              )}
            </>
          )}

          <span
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight border shadow-sm flex items-center gap-2 transition-all duration-300 ${getPrazoColor(card.prazo)}`}
          >
            <Clock className="w-3.5 h-3.5" />
            {card.prazo}
          </span>
          <div className="relative group/avatar ml-2">
            <UserAvatar name={card.responsavel} size="sm" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
