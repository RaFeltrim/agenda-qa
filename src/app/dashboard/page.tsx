import { useState, useEffect } from 'react';
import { Row, Col, Typography, Divider } from 'antd';
import KanbanBoard from '../../components/Kanban/KanbanBoard';
import CardModal from '../../components/Kanban/CardModal';
import CreateCardModal from '../../components/Kanban/CreateCardModal';
import DashboardStats from '../../components/Dashboard/DashboardStats';
import UpcomingMeetings from '../../components/Dashboard/UpcomingMeetings';
import MeetingKanban from '../../components/Dashboard/MeetingKanban';
import MeetingNotifier from '../../components/Dashboard/MeetingNotifier';
import { useKanban } from '../../hooks/useKanban';
import { useMeetingStore } from '../../store/meetingStore';
import { useAuth } from '../../hooks/useAuth';
import type { Card, CardStatus } from '../../types';
import { Plus } from 'lucide-react';
import { Button } from 'antd';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { cards, moveCard, create: addCard, update: updateCard, remove: deleteCard } = useKanban();
  const { meetings, fetchMeetings, setCurrentUserId } = useMeetingStore();
  const { user } = useAuth();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createCardStatus, setCreateCardStatus] = useState<CardStatus>('backlog');

  // Fetch meetings on mount and set userId
  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
      fetchMeetings();
    }
  }, [user?.id, fetchMeetings, setCurrentUserId]);

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
      urgente: false,
    });
  };

  const handleUpdateCard = (card: Card) => {
    updateCard(card.id, card);
  };

  const handleDeleteCard = (cardId: string) => {
    deleteCard(cardId);
  };

  return (
    <div className="py-6 min-h-screen animate-fadeIn">
      {/* Meeting Proximity Notifier (invisible, side-effect only) */}
      <MeetingNotifier meetings={meetings} />

      {/* ─── Section 1: Dashboard Header with Stats + Upcoming Meetings ─── */}
      <div className="px-2 mb-6">
        <div className="mb-4">
          <Title level={2} style={{ margin: 0 }}>Portal de Governança</Title>
          <Text type="secondary">Gerencie suas reuniões e fluxos de tarefas em um só lugar.</Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Left: Stats Cards */}
          <Col xs={24} lg={16}>
            <DashboardStats cards={cards} meetings={meetings} />
          </Col>

          {/* Right: Upcoming Meetings */}
          <Col xs={24} lg={8}>
            <UpcomingMeetings meetings={meetings} />
          </Col>
        </Row>
      </div>

      <Divider className="!my-4" />

      {/* ─── Section 2: Task Kanban Board ─── */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 px-2 mb-4">
          <div>
            <Title level={4} style={{ margin: 0 }}>Quadro de Tarefas</Title>
            <Text type="secondary" className="text-sm">Arraste os cards para alterar o status</Text>
          </div>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => handleAddCard('backlog')}
          >
            Novo Card
          </Button>
        </div>

        <KanbanBoard
          cards={cards}
          onCardClick={handleCardClick}
          onStatusChange={handleStatusChange}
          onAddCard={handleAddCard}
        />
      </div>

      <Divider className="!my-4" />

      {/* ─── Section 3: Meeting Kanban Board ─── */}
      <div className="mb-6">
        <MeetingKanban />
      </div>

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
