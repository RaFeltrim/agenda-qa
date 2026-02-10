import { useState, useEffect } from 'react';
import { Card, Space, Button, Input, Badge, Tag, Typography, Dropdown, Tabs, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, ClockCircleOutlined, LinkOutlined, SwapOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import { useMeetingStore, type Meeting } from '../store/meetingStore';
import { useAuth } from '../hooks/useAuth';
import { MeetingModal } from './MeetingModal';
import dayjs from 'dayjs';

const { Search } = Input;
const { Text, Title } = Typography;

const columns = [
    { id: 'a-agendar', title: 'A Agendar', color: '#64748b' },
    { id: 'confirmada', title: 'Confirmada', color: '#3b82f6' },
    { id: 'realizada', title: 'Realizada', color: '#10b981' }
    ];

const statusColors: Record<string, string> = {
        'a-agendar': 'default',
        'confirmada': 'processing',
        'realizada': 'success'
};

const useIsMobile = () => {
        const [isMobile, setIsMobile] = useState(false);
        useEffect(() => {
                    const checkMobile = () => setIsMobile(window.innerWidth < 768);
                    checkMobile();
                    window.addEventListener('resize', checkMobile);
                    return () => window.removeEventListener('resize', checkMobile);
        }, []);
        return isMobile;
};

interface MeetingCardProps {
        meeting: Meeting;
        canEditContent: boolean;
        canManageMeetings: boolean;
        isMobile: boolean;
        onEdit: () => void;
        onDelete: () => void;
        onMove: (newStatus: string) => void;
        isDragging?: boolean;
}

const MeetingCard: React.FC<MeetingCardProps> = ({
        meeting, canEditContent, canManageMeetings, isMobile,
        onEdit, onDelete, onMove, isDragging = false
}) => {
        const moveMenuItems = columns
            .filter(col => col.id !== meeting.status)
            .map(col => ({
                            key: col.id,
                            label: (
                                                <span className="flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }}></span>
                                                    {col.title}
                                                </span>
                                            ),
                            onClick: () => onMove(col.id)
            }));
    
        return (
                    <Card
                                    hoverable size="small"
                                    className={`border-none rounded-xl touch-manipulation ${isDragging ? 'rotate-2 scale-105 shadow-premium z-50' : ''}`}
                                    bodyStyle={{ padding: '16px' }}
                                    actions={[
                                                        ...(canEditContent ? [
                                                                                <div key="edit" className="hover:text-brand-500 py-1 min-h-[44px] flex items-center justify-center" onClick={onEdit}>
                                                                                                        <EditOutlined />
                                                                                    </div>
                                                                            ] : []),
                                                        ...(canManageMeetings ? [
                                                                                <div key="delete" className="hover:text-red-500 py-1 min-h-[44px] flex items-center justify-center" onClick={onDelete}>
                                                                                                        <DeleteOutlined />
                                                                                    </div>
                                                                            ] : [])
                                                    ]}
                                >
                                <Space direction="vertical" size="small" className="w-full">
                                                <Text className="font-semibold text-base block mb-1">{meeting.title}</Text>
                                                <div className="flex flex-col gap-1 mt-1">
                                                                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                                                            <CalendarOutlined />
                                                                                            <span>{dayjs(meeting.date).format('DD/MM/YYYY')}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-slate-500 text-xs text-brand-500">
                                                                                            <ClockCircleOutlined />
                                                                                            <span>{meeting.time}</span>
                                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                                                                    <Tag color={statusColors[meeting.status]} className="rounded-full text-[10px] font-bold uppercase tracking-wider border-none px-3">
                                                                        {meeting.status}
                                                                    </Tag>
                                                    {canEditContent && (isMobile || window.matchMedia('(hover: none)').matches) && (
                                                            <Dropdown menu={{ items: moveMenuItems }} trigger={['click']}>
                                                                                        <Button size="small" icon={<SwapOutlined />} className="text-xs rounded-lg min-h-[32px] touch-manipulation">
                                                                                                                        Mover
                                                                                            </Button>
                                                            </Dropdown>
                                                                    )}
                                                </div>
                                    {meeting.meetingLink && (
                                                        <Button type="primary" ghost size="small" block icon={<LinkOutlined />}
                                                                                    className="mt-3 border-brand-500 text-brand-500 hover:bg-brand-50 min-h-[44px] touch-manipulation"
                                                                                    onClick={(e) => { e.stopPropagation(); window.open(meeting.meetingLink, '_blank'); }}
                                                                                >
                                                                                Entrar na Reunião
                                                        </Button>
                                                )}
                                </Space>
                    </Card>
                );
};

interface KanbanColumnProps {
        column: typeof columns[0];
        meetings: Meeting[];
        canEditContent: boolean;
        canManageMeetings: boolean;
        isMobile: boolean;
        onEdit: (meeting: Meeting) => void;
        onDelete: (id: string) => void;
        onMove: (id: string, newStatus: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
        column, meetings, canEditContent, canManageMeetings, isMobile,
        onEdit, onDelete, onMove
}) => {
        return (
                    <div className="flex-shrink-0 w-full md:w-80 snap-center">
                                <div className="flex items-center justify-between mb-4 px-2">
                                                <Space size="small">
                                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color }}></div>
                                                                    <Title level={5} style={{ margin: 0, fontSize: '14px' }}>{column.title}</Title>
                                                                    <Badge count={meetings.length} className="ml-1"
                                                                                                style={{ backgroundColor: '#e2e8f0', color: '#475569', boxShadow: 'none' }} />
                                                </Space>
                                </div>
                                <Droppable droppableId={column.id}>
                                    {(provided) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef}
                                                                        className="bg-slate-100/50 p-3 rounded-xl min-h-[400px] md:min-h-[600px] border border-dashed border-slate-200">
                                                {meetings.map((meeting, index) => (
                                                                                                        <Draggable key={meeting.id} draggableId={meeting.id} index={index} isDragDisabled={isMobile}>
                                                                                                            {(provided, snapshot) => (
                                                                                                                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                                                                                                                                                            className="mb-4" style={{ ...provided.draggableProps.style }}>
                                                                                                                                                                                        <MeetingCard
                                                                                                                                                                                                                                        meeting={meeting}
                                                                                                                                                                                                                                        canEditContent={canEditContent}
                                                                                                                                                                                                                                        canManageMeetings={canManageMeetings}
                                                                                                                                                                                                                                        isMobile={isMobile}
                                                                                                                                                                                                                                        isDragging={snapshot.isDragging}
                                                                                                                                                                                                                                        onEdit={() => onEdit(meeting)}
                                                                                                                                                                                                                                        onDelete={() => {
                                                                                                                                                                                                                                                                                            Modal.confirm({
                                                                                                                                                                                                                                                                                                                                                    title: 'Excluir reunião?',
                                                                                                                                                                                                                                                                                                                                                    icon: <ExclamationCircleOutlined />,
                                                                                                                                                                                                                                                                                                                                                    content: `Tem certeza que deseja excluir "${meeting.title}"?`,
                                                                                                                                                                                                                                                                                                                                                    okText: 'Excluir',
                                                                                                                                                                                                                                                                                                                                                    okType: 'danger',
                                                                                                                                                                                                                                                                                                                                                    cancelText: 'Cancelar',
                                                                                                                                                                                                                                                                                                                                                    onOk: () => onDelete(meeting.id),
                                                                                                                                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                                                                        }}
                                                                                                                                                                                                                                        onMove={(newStatus) => onMove(meeting.id, newStatus)}
                                                                                                                                                                                                                                    />
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
};

export const KanbanBoard = () => {
        const { meetings, fetchMeetings, moveMeeting, createMeeting, deleteMeeting,
                       setSelectedMeeting, setModalOpen, isModalOpen, selectedMeeting } = useMeetingStore();
        const { user, role } = useAuth();
        const [search, setSearch] = useState('');
        const [activeTab, setActiveTab] = useState('a-agendar');
        const isMobile = useIsMobile();

        // Fetch meetings on mount and when user changes
        useEffect(() => {
                    if (user) {
                                    fetchMeetings();
                    }
        }, [user, fetchMeetings]);
    
        const canEditContent = role === 'admin' || role === 'user';
        const canManageMeetings = role === 'admin';
    
        const filteredMeetings = meetings.filter(m =>
                    m.title.toLowerCase().includes(search.toLowerCase())
                );
    
        const onDragEnd = (result: DropResult) => {
                    if (!canEditContent) return;
                    if (!result.destination) return;
                    const { draggableId, source, destination } = result;
                    const newStatus = destination.droppableId;
                    moveMeeting(draggableId, source.index, destination.index, newStatus);
        };
    
        const handleMoveCard = (meetingId: string, newStatus: string) => {
                    const meeting = meetings.find(m => m.id === meetingId);
                    if (meeting) {
                                    const sourceIndex = filteredMeetings.filter(m => m.status === meeting.status).findIndex(m => m.id === meetingId);
                                    const destIndex = filteredMeetings.filter(m => m.status === newStatus).length;
                                    moveMeeting(meetingId, sourceIndex, destIndex, newStatus);
                    }
        };
    
        const handleEdit = (meeting: Meeting) => {
                    setSelectedMeeting(meeting);
                    setModalOpen(true);
        };
    
        const tabItems = columns.map(col => {
                    const colMeetings = filteredMeetings.filter(m => m.status === col.id);
                    return {
                                    key: col.id,
                                    label: (
                                                        <span className="flex items-center gap-2">
                                                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }}></span>
                                                            {col.title}
                                                                            <Badge count={colMeetings.length}
                                                                                                        style={{ backgroundColor: '#e2e8f0', color: '#475569', boxShadow: 'none' }} />
                                                        </span>
                                                    ),
                                    children: (
                                                        <KanbanColumn column={col} meetings={colMeetings}
                                                                                canEditContent={canEditContent} canManageMeetings={canManageMeetings}
                                                                                isMobile={isMobile} onEdit={handleEdit} onDelete={deleteMeeting} onMove={handleMoveCard} />
                                                    )
                    };
        });
    
        return (
                    <div data-testid="kanban-board" className="mt-4">
                                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-soft">
                                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                                    {canEditContent && (
                                                <Button type="primary" size="large" icon={<PlusOutlined />}
                                                                                onClick={() => createMeeting()}
                                                                                className="rounded-lg h-12 sm:h-11 px-6 font-semibold w-full sm:w-auto min-h-[44px] touch-manipulation"
                                                                                data-testid="new-meeting-btn">
                                                                            Nova Reunião
                                                </Button>
                                                                    )}
                                                                    <Search placeholder="Buscar reuniões..." allowClear
                                                                                                onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-64" size="large" />
                                                </div>
                                                <Text type="secondary" className="font-medium text-center sm:text-right">
                                                    {filteredMeetings.length} reuniões
                                                </Text>
                                </div>
                    
                                <DragDropContext onDragEnd={onDragEnd}>
                                    {isMobile ? (
                                            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems}
                                                                        className="kanban-mobile-tabs"
                                                                        tabBarStyle={{ marginBottom: 16, padding: '0 8px', position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc' }} />
                                        ) : (
                                            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
                                                {columns.map((col) => {
                                                                            const colMeetings = filteredMeetings.filter(m => m.status === col.id);
                                                                            return (
                                                                                                                <KanbanColumn key={col.id} column={col} meetings={colMeetings}
                                                                                                                                                        canEditContent={canEditContent} canManageMeetings={canManageMeetings}
                                                                                                                                                        isMobile={isMobile} onEdit={handleEdit} onDelete={deleteMeeting} onMove={handleMoveCard} />
                                                                                                            );
                                            })}
                                            </div>
                                                )}
                                </DragDropContext>
                    
                                <MeetingModal open={isModalOpen} onOpenChange={setModalOpen}
                                                    initialValues={selectedMeeting || undefined} />
                    </div>
                );
};
