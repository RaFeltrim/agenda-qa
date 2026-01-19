import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType, CardStatus } from '../../types';
import { STATUS_COLUMNS } from '../../constants';
import Card from './Card';
import { KanbanBoardSkeleton } from '../Common/Skeleton';
import { Plus, LayoutPanelTop, MoreHorizontal } from 'lucide-react';

interface KanbanBoardProps {
  cards: CardType[];
  onCardClick: (card: CardType) => void;
  onStatusChange: (cardId: string, newStatus: CardStatus) => void;
  onAddNewToColumn: (status: CardStatus) => void;
  userRole?: 'editor' | 'viewer' | null;
  loading?: boolean;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  cards,
  onCardClick,
  onStatusChange,
  onAddNewToColumn,
  userRole,
  loading = false,
}) => {
  const [dragOverCol, setDragOverCol] = useState<CardStatus | null>(null);

  // Check if user can edit (only editors can edit)
  const canEdit = userRole === 'editor';

  const getCardsByStatus = (status: CardStatus) => {
    return cards.filter(c => c.status === status);
  };

  const handleDragOver = (e: React.DragEvent, status: CardStatus) => {
    e.preventDefault();
    setDragOverCol(status);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: CardStatus) => {
    const cardId = e.dataTransfer.getData('cardId');
    setDragOverCol(null);
    if (cardId) {
      onStatusChange(cardId, targetStatus);
    }
  };

  const onDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('cardId', cardId);
  };

  // Show skeleton loading when data is being fetched
  if (loading) {
    return <KanbanBoardSkeleton />;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mobile:gap-4 items-start">
        {STATUS_COLUMNS.map(col => {
          const columnCards = getCardsByStatus(col.id as CardStatus);
          const isDraggingOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              className={`flex flex-col h-full min-h-[600px] rounded-[2.5rem] p-4 mobile:p-3 transition-all duration-500 border-2 ${
                isDraggingOver
                  ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-400/50 dark:border-indigo-500/30 scale-[1.02] shadow-2xl'
                  : 'bg-slate-100/30 dark:bg-slate-900/20 border-transparent'
              }`}
              onDragOver={canEdit ? e => handleDragOver(e, col.id as CardStatus) : undefined}
              onDrop={canEdit ? e => handleDrop(e, col.id as CardStatus) : undefined}
              onDragLeave={canEdit ? () => setDragOverCol(null) : undefined}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-6 px-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${col.id === 'backlog' ? 'bg-slate-400' : col.id === 'em-progresso' ? 'bg-indigo-500 shadow-glow shadow-indigo-500/50' : col.id === 'bloqueado' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  ></div>
                  <h2 className="font-black text-sm text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                    {col.title}
                  </h2>
                  <span className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-2xl text-[10px] font-black shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                    {columnCards.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {canEdit && (
                    <button
                      onClick={() => onAddNewToColumn(col.id as CardStatus)}
                      className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-indigo-600 hover:shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card List Container */}
              <div className="flex flex-col gap-5 flex-1">
                {columnCards.map((card, index) => (
                  <div
                    key={card.id}
                    draggable={canEdit}
                    onDragStart={canEdit ? (e: React.DragEvent) => onDragStart(e, card.id) : undefined}
                    className={`${canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                  >
                    <Card 
                      card={card} 
                      onClick={onCardClick} 
                      userRole={userRole ?? null} 
                      index={index} 
                    />
                  </div>
                ))}

                {columnCards.length === 0 && !isDraggingOver && (
                  <div className="flex-1 border-2 border-dashed border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] flex flex-col items-center justify-center p-12 text-slate-400 opacity-40 group hover:opacity-60 transition-opacity">
                    <LayoutPanelTop className="w-10 h-10 mb-4 text-slate-300 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-black uppercase tracking-widest">
                      Sem tarefas no momento
                    </p>
                  </div>
                )}

                {isDraggingOver && (
                  <div className="h-32 border-2 border-dashed border-indigo-400 dark:border-indigo-600 rounded-[2rem] bg-indigo-500/10 flex flex-col items-center justify-center gap-3 animate-pulse">
                    <Plus className="w-8 h-8 text-indigo-500" />
                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em]">
                      Release here
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
