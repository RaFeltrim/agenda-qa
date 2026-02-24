import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
  useDroppable,
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from '@dnd-kit/core';
import { Plus, Calendar, MessageSquare } from 'lucide-react';
import type { Card, CardStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../UserAvatar';

const STATUS_COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'bg-slate-400' },
  { id: 'em-progresso', title: 'Em Progresso', color: 'bg-blue-500' },
  { id: 'bloqueado', title: 'Bloqueado', color: 'bg-red-500' },
  { id: 'concluido', title: 'Concluído', color: 'bg-emerald-500' },
] as const;

// Card Component
interface CardItemProps {
  card: Card;
  onClick: (card: Card) => void;
}

function CardItem({ card, onClick }: CardItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
    data: { card },
  });

  const getPriorityColor = () => {
    if (card.urgente) return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
    if (card.status === 'bloqueado') return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
    return 'border-l-indigo-500 bg-white dark:bg-slate-800';
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onClick(card)}
      className={`
        ${getPriorityColor()}
        ${isDragging ? 'opacity-50 rotate-2' : ''}
        border-l-4 rounded-lg p-3 cursor-grab active:cursor-grabbing
        bg-white dark:bg-slate-800 shadow-sm hover:shadow-md
        border border-slate-200 dark:border-slate-700
        transition-all duration-200
      `}
    >
      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="font-medium text-sm text-slate-900 dark:text-white mb-2 line-clamp-2">
        {card.titulo || card.title || 'Untitled'}
      </h4>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          {/* Due Date */}
          {card.prazo && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(card.prazo).toLocaleDateString('pt-BR')}
            </span>
          )}
          {/* Comments */}
          {card.comentariosOld && card.comentariosOld.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {card.comentariosOld.length}
            </span>
          )}
        </div>
        
        {/* Assignee */}
        {card.responsavel && (
          <UserAvatar name={card.responsavel} size="xs" />
        )}
      </div>
    </div>
  );
}

// Column Component
interface ColumnProps {
  column: typeof STATUS_COLUMNS[number];
  cards: Card[];
  onCardClick: (card: Card) => void;
  onAddCard: (status: CardStatus) => void;
  canEdit: boolean;
}

function Column({ column, cards, onCardClick, onAddCard, canEdit }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col w-72 lg:w-80 min-w-72 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3
        transition-colors duration-200
        ${isOver ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}
      `}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
          <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
            {column.title}
          </h3>
          <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs font-medium">
            {cards.length}
          </span>
        </div>
        
        {canEdit && (
          <button
            onClick={() => onAddCard(column.id as CardStatus)}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            <Plus className="w-4 h-4 text-slate-500" />
          </button>
        )}
      </div>

      {/* Cards Container */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {cards.map((card) => (
          <CardItem key={card.id} card={card} onClick={onCardClick} />
        ))}
        
        {cards.length === 0 && !isOver && (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              No cards
            </p>
          </div>
        )}

        {isOver && (
          <div className="h-24 border-2 border-dashed border-indigo-400 rounded-lg flex items-center justify-center">
            <p className="text-xs text-indigo-500 font-medium">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Main KanbanBoard Component
interface KanbanBoardProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
  onStatusChange: (cardId: string, newStatus: CardStatus) => void;
  onAddCard: (status: CardStatus) => void;
}

export default function KanbanBoard({ cards, onCardClick, onStatusChange, onAddCard }: KanbanBoardProps) {
  const { role } = useAuth();
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const canEdit = role === 'admin' || role === 'user';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = active.data.current?.card as Card;
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const newStatus = over.id as CardStatus;
    const cardId = active.id as string;
    const currentCard = cards.find((c) => c.id === cardId);

    if (currentCard && currentCard.status !== newStatus) {
      onStatusChange(cardId, newStatus);
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: '0.5' },
      },
    }),
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map((col) => {
          const columnCards = cards.filter((c) => c.status === col.id);
          return (
            <Column
              key={col.id}
              column={col}
              cards={columnCards}
              onCardClick={onCardClick}
              onAddCard={onAddCard}
              canEdit={canEdit}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeCard ? (
          <div className="opacity-90 rotate-2 cursor-grabbing w-72">
            <CardItem card={activeCard} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
