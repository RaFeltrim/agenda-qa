import { Card, Space, Button, Badge, Tag, Typography, Select, Empty, Tooltip } from 'antd';
import { PlusOutlined, InfoCircleOutlined, CalendarOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import { useCardStore } from '../store/cardStore';
import { useSprintStore } from '../store/sprintStore';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState   } from 'react';
import type { CardStatus, Sprint } from '../types';
import { SprintModal, type SprintFormValues } from './Modals/SprintModal';
import { CardDetailModal } from './Modals/CardDetailModal';

const { Text, Title } = Typography;

/** Valid column statuses for the TaskBoard - typed explicitly */
const VALID_STATUSES: CardStatus[] = ['todo', 'in-progress', 'done'];

const columns: { id: CardStatus; title: string; color: string }[] = [
    { id: 'todo', title: 'A Fazer', color: '#64748b' },
    { id: 'in-progress', title: 'Em Progresso', color: '#3b82f6' },
    { id: 'done', title: 'Concluído', color: '#10b981' }
];

const priorityColors: Record<string, string> = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    critical: 'purple'
};

/** Type guard for valid CardStatus */
function isValidCardStatus(status: string): status is CardStatus {
    return VALID_STATUSES.includes(status as CardStatus);
}

export const TaskBoard = () => {
    const { cards, fetchCards, moveCard, addCard, setCurrentUserId } = useCardStore();
    const { sprints, activeSprintId, fetchSprints, setActiveSprint, addSprint, updateSprint, archiveSprint } = useSprintStore();
    const { user, role } = useAuth();

    // Permissions
    const userRole = role;
    const canManageSprints = userRole === 'admin';
    const canEditContent = userRole === 'admin' || userRole === 'user';

    // Local state for modals
    const [isSprintModalOpen, setIsSprintModal] = useState(false);
    const [editingSprint, setEditingSprint] = useState<Sprint | undefined>(undefined);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    // Set current user ID for audit logging
    useEffect(() => {
        if (user?.id) {
            setCurrentUserId(user.id);
        }
    }, [user?.id, setCurrentUserId]);

    useEffect(() => {
        fetchCards();
        fetchSprints();
    }, [fetchCards, fetchSprints]);

    const activeSprint = sprints.find(s => s.id === activeSprintId);

    const filteredCards = activeSprintId
        ? cards.filter(c => c.sprintId === activeSprintId)
        : cards;

    const onDragEnd = (result: DropResult): void => {
        if (!canEditContent) return;
        if (!result.destination) return;
        
        const { draggableId, destination } = result;
        const newStatus = destination.droppableId;
        
        // Type-safe status validation
        if (!isValidCardStatus(newStatus)) {
            console.error(`Invalid card status: ${newStatus}`);
            return;
        }
        
        moveCard(draggableId, newStatus);
    };

    const handleCreateTask = () => {
        const title = prompt('Nome da tarefa:');
        if (title) {
            addCard({
                title,
                priority: 'medium',
                status: 'todo',
                tags: [],
                description: 'Nova tarefa rápida',
                subTasks: [],
                comments: [],
                attachments: [],
                history: [],
                sprintId: activeSprintId
            });
        }
    };

    // Sprint Handlers
    const handleOpenCreateSprint = () => {
        setEditingSprint(undefined);
        setIsSprintModal(true);
    };

    const handleOpenEditSprint = () => {
        if (activeSprint) {
            setEditingSprint(activeSprint);
            setIsSprintModal(true);
        }
    };

    const handleSprintSubmit = (values: SprintFormValues) => {
        if (editingSprint) {
            updateSprint(editingSprint.id, values);
        } else {
            addSprint(values);
        }
        setIsSprintModal(false);
        setEditingSprint(undefined);
    };

    const handleArchiveSprint = () => {
        if (activeSprint && window.confirm(`Tem certeza que deseja arquivar a sprint "${activeSprint.name}"?`)) {
            archiveSprint(activeSprint.id);
            setActiveSprint(null); // Clear selection or select next available
        }
    };

    const handleCardClick = (cardId: string) => {
        setSelectedCardId(cardId);
    };

    return (
        <div data-testid="task-board" className="mt-4">
            <div className="flex flex-col gap-4 mb-4 bg-white p-4 rounded-xl shadow-soft">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <Title level={4} style={{ margin: 0 }}>
                            {activeSprint ? activeSprint.name : 'Backlog Geral'}
                        </Title>
                        <Select
                            style={{ width: 240 }}
                            placeholder="Selecione uma Sprint"
                            value={activeSprintId}
                            onChange={setActiveSprint}
                            allowClear
                            options={sprints
                                .filter(s => s.status !== 'archived') // Only show active/planned
                                .map(s => ({ label: s.name, value: s.id }))
                            }
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    {canManageSprints && (
                                        <div style={{ padding: '8px', borderTop: '1px solid #e8e8e8' }}>
                                            <Button
                                                type="link"
                                                size="small"
                                                icon={<PlusOutlined />}
                                                onClick={handleOpenCreateSprint}
                                                style={{ width: '100%', textAlign: 'left' }}
                                            >
                                                Nova Sprint
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        />

                        {activeSprint && canManageSprints && (
                            <Space size="small">
                                <Tooltip title="Editar Sprint">
                                    <Button
                                        icon={<EditOutlined />}
                                        size="small"
                                        onClick={handleOpenEditSprint}
                                    />
                                </Tooltip>
                                <Tooltip title="Arquivar Sprint">
                                    <Button
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        danger
                                        onClick={handleArchiveSprint}
                                    />
                                </Tooltip>
                            </Space>
                        )}
                    </div>
                    {canEditContent && (
                        <Space>
                            <Button
                                type="primary"
                                size="large"
                                icon={<PlusOutlined />}
                                onClick={handleCreateTask}
                                className="rounded-lg h-11 px-6 font-semibold"
                                disabled={!activeSprintId && cards.length > 0} // Can create to backlog if enabled, but let's stick to logic
                            >
                                Nova Tarefa
                            </Button>
                        </Space>
                    )}
                </div>

                <div className="flex justify-between items-center px-1">
                    <Text type="secondary" className="font-medium text-xs">
                        {activeSprint ? (
                            <Space>
                                <CalendarOutlined /> {activeSprint.startDate} - {activeSprint.endDate}
                                <span className="mx-2">•</span>
                                <Tag color={activeSprint.status === 'active' ? 'green' : 'blue'}>
                                    {activeSprint.status.toUpperCase()}
                                </Tag>
                                <span className="mx-2">•</span>
                                {activeSprint.goal}
                            </Space>
                        ) : 'Selecione uma sprint para gerenciar o foco do time.'}
                    </Text>
                    <Text type="secondary" className="font-medium">
                        {filteredCards.length} tarefas
                    </Text>
                </div>
            </div>

            {(!activeSprintId && filteredCards.length === 0) ? (
                <Empty
                    description={
                        <div className="flex flex-col items-center gap-2">
                            <span>Selecione uma sprint ou crie uma tarefa</span>
                            <Button type="primary" onClick={handleOpenCreateSprint}>
                                Criar Primeira Sprint
                            </Button>
                        </div>
                    }
                />
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-6 overflow-x-auto pb-4">
                        {columns.map((col) => {
                            const colCards = filteredCards.filter(t => t.status === col.id);
                            return (
                                <div key={col.id} className="flex-shrink-0 w-80">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <Space size="small">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }}></div>
                                            <Title level={5} style={{ margin: 0, fontSize: '14px' }}>
                                                {col.title}
                                            </Title>
                                            <Badge
                                                count={colCards.length}
                                                style={{ backgroundColor: '#e2e8f0', color: '#475569', boxShadow: 'none' }}
                                            />
                                        </Space>
                                    </div>

                                    <Droppable droppableId={col.id}>
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="bg-slate-100/50 p-3 rounded-xl min-h-[600px] border border-dashed border-slate-200"
                                            >
                                                {colCards.map((card, index) => (
                                                    <Draggable key={card.id} draggableId={card.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="mb-4"
                                                                style={{ ...provided.draggableProps.style }}
                                                            >
                                                                <Card
                                                                    hoverable
                                                                    size="small"
                                                                    onClick={() => handleCardClick(card.id)}
                                                                    className={`border-none rounded-xl ${snapshot.isDragging ? 'shadow-premium rotate-1' : ''}`}
                                                                    bodyStyle={{ padding: '16px' }}
                                                                >
                                                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                                        <div className="flex justify-between items-start">
                                                                            <Text className="font-semibold text-base leading-tight w-3/4">
                                                                                {card.title}
                                                                            </Text>
                                                                            <Tag
                                                                                color={priorityColors[card.priority]}
                                                                                className="m-0 rounded border-none text-[10px] font-bold uppercase"
                                                                            >
                                                                                {card.priority}
                                                                            </Tag>
                                                                        </div>
                                                                        {card.description && (
                                                                            <div className="text-slate-500 text-xs mt-1">
                                                                                {card.description}
                                                                            </div>
                                                                        )}
                                                                        <div className="flex items-center gap-2 mt-2 text-slate-400 text-[10px]">
                                                                            <InfoCircleOutlined />
                                                                            <span>ID: {card.id.substring(0, 8)}</span>
                                                                        </div>
                                                                    </Space>
                                                                </Card>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </div>
                </DragDropContext>
            )}

            <SprintModal
                open={isSprintModalOpen}
                onClose={() => setIsSprintModal(false)}
                onSubmit={handleSprintSubmit}
                initialValues={editingSprint}
            />

            <CardDetailModal
                cardId={selectedCardId}
                open={!!selectedCardId}
                onClose={() => setSelectedCardId(null)}
            />
        </div>
    );
};
