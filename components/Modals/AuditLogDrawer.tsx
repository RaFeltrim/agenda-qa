import React from 'react';
import { X, Clock, User, Tag, ArrowRight, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Card } from '../../types';
import { formatTimeAgo } from '../../utils/dateUtils';

interface AuditLogDrawerProps {
  cards: Card[];
  onClose: () => void;
}

const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({ cards, onClose }) => {
  const allHistory = cards
    .flatMap(card =>
      card.historico.map(h => ({
        ...h,
        cardTitle: card.titulo,
        cardId: card.id,
      }))
    )
    .sort((a, b) => new Date(b.em).getTime() - new Date(a.em).getTime());

  const getIcon = (acao: string) => {
    if (acao.includes('comentário')) return <MessageSquare className="w-3 h-3" />;
    if (acao.includes('status')) return <ArrowRight className="w-3 h-3" />;
    if (acao.includes('concluída')) return <CheckCircle2 className="w-3 h-3" />;
    return <Clock className="w-3 h-3" />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-white/20">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-black dark:text-white uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Audit Log
            </h2>
            <p className="text-xs text-slate-500 font-bold tracking-wider mt-1">
              Rastreabilidade Completa
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {allHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-40">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-400">
                Sem registros
              </p>
            </div>
          ) : (
            allHistory.map((h, i) => (
              <div
                key={i}
                className="group relative pl-8 border-l-2 border-slate-100 dark:border-slate-800 pb-2"
              >
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 flex items-center justify-center shadow-sm z-10">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                    {formatTimeAgo(h.em)}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    {h.por}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 group-hover:border-indigo-200 dark:group-hover:border-indigo-800 transition-all shadow-sm">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
                    {getIcon(h.acao)}
                    {h.acao}
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-medium text-slate-500">Contexto:</span>
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 truncate bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                      {h.cardTitle}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogDrawer;
