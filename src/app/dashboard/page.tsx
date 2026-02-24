import { useState } from 'react';
import KanbanBoard from '../../components/Kanban/KanbanBoard';
import CardModal from '../../components/Kanban/CardModal';
import CreateCardModal from '../../components/Kanban/CreateCardModal';
import { useKanban } from '../../hooks/useKanban';
import type { Card, CardStatus } from '../../types';
import { Plus } from 'lucide-react';
import { Space, Typography, Button } from 'antd';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { cards, moveCard, create: addCard, update: updateCard, remove: deleteCard } = useKanban();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createCardStatus, setCreateCardStatus] = useState<CardStatus>('backlog');

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };

  const handleStatusChange = (cardId: string, newStatus: CardStatus) => {
    moveCard(cardId, newStatus);
  };

  const handleAddCard = (status: CardStatus) => {
    setCreateCardStatus(status);
    setIsCreateModalOpen(true);
  };

  const handleCreateCard = (cardData: { titulo: string; status: CardStatus; tags: string[] }) => {
    addCard({
      titulo: cardData.titulo,
      title: cardData.titulo,
      status: cardData.status,
      tags: cardData.tags,
      priority: 'medium',
      subTasks: [],
      comments: [],
      attachments: [],
      history: [],
    });
  };

  const handleUpdateCard = (card: Card) => {
    updateCard(card.id, card);
  };

  const handleDeleteCard = (cardId: string) => {
    deleteCard(cardId);
  };

  return (
    <div className="py-6 min-h-screen">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
          <div>
            <Title level={2} style={{ margin: 0 }}>Portal de Governança</Title>
            <Text type="secondary">Gerencie suas reuniões e fluxos de tarefas em um só lugar.</Text>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => handleAddCard('backlog')}
              className="bg-indigo-600"
            >
              Novo Card
            </Button>
          </div>
        </div>

        <KanbanBoard
          cards={cards}
          onCardClick={handleCardClick}
          onStatusChange={handleStatusChange}
          onAddCard={handleAddCard}
        />
      </Space>

      {/* Card Detail Modal */}
      <CardModal
        card={selectedCard}
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setSelectedCard(null);
        }}
        onSave={handleUpdateCard}
        onDelete={handleDeleteCard}
      />

      {/* Create Card Modal */}
      <CreateCardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateCard}
        defaultStatus={createCardStatus}
      />
    </div>
  );
}
