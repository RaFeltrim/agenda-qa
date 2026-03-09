import { useState } from 'react';
import { Card, Typography, Tag, Button, Tooltip, Popconfirm } from 'antd';
import {
    PlusOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    LinkOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import type { Meeting } from '../../store/meetingStore';
import { useMeetingStore } from '../../store/meetingStore';
import { MeetingModal } from '../MeetingModal';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

type MeetingStatus = Meeting['status'];

const COLUMNS: { key: MeetingStatus; title: string; color: string }[] = [
    { key: 'a-agendar', title: 'A Agendar', color: '#f59e0b' },
    { key: 'confirmada', title: 'Confirmada', color: '#10b981' },
    { key: 'realizada', title: 'Realizada', color: '#6366f1' },
];

function MeetingCard({
    meeting,
    onEdit,
    onDelete,
}: {
    meeting: Meeting;
    onEdit: (meeting: Meeting) => void;
    onDelete: (id: string) => void;
}) {
    return (
        <div
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-600
                       bg-white dark:bg-slate-800 hover:shadow-md transition-all
                       group cursor-pointer"
        >
            <div className="flex items-start justify-between gap-2">
                <Title level={5} className="!text-sm !mb-1 !leading-tight flex-1 truncate" style={{ margin: 0 }}>
                    {meeting.title}
                </Title>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip title="Editar">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={(e) => { e.stopPropagation(); onEdit(meeting); }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Excluir esta reunião?"
                        onConfirm={() => onDelete(meeting.id)}
                        okText="Sim"
                        cancelText="Não"
                    >
                        <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Popconfirm>
                </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                    <CalendarOutlined />
                    {meeting.date ? dayjs(meeting.date).format('DD/MM/YYYY') : '--/--'}
                </span>
                <span className="flex items-center gap-1">
                    <ClockCircleOutlined />
                    {meeting.time?.substring(0, 5) || '--:--'}
                </span>
            </div>

            {meeting.description && (
                <Text type="secondary" className="!text-xs mt-2 line-clamp-2 block">
                    {meeting.description}
                </Text>
            )}

            {meeting.meetingLink && (
                <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-brand-500 hover:text-brand-600"
                    onClick={(e) => e.stopPropagation()}
                >
                    <LinkOutlined />
                    Entrar na reunião
                </a>
            )}
        </div>
    );
}

export default function MeetingKanban() {
    const { meetings, deleteMeeting, moveMeeting, fetchMeetings } = useMeetingStore();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
    const [addingToStatus, setAddingToStatus] = useState<MeetingStatus>('a-agendar');

    const handleEdit = (meeting: Meeting) => {
        setEditingMeeting(meeting);
        setModalOpen(true);
    };

    const handleAddToColumn = (status: MeetingStatus) => {
        setAddingToStatus(status);
        setEditingMeeting(null);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await deleteMeeting(id);
    };

    const handleModalClose = async (open: boolean) => {
        setModalOpen(open);
        if (!open) {
            setEditingMeeting(null);
            await fetchMeetings();
        }
    };

    const handleStatusChange = async (meetingId: string, newStatus: MeetingStatus) => {
        await moveMeeting(meetingId, 0, 0, newStatus);
    };

    const getMeetingsByStatus = (status: MeetingStatus) =>
        meetings
            .filter(m => m.status === status)
            .sort((a, b) => dayjs(`${a.date} ${a.time}`).diff(dayjs(`${b.date} ${b.time}`)));

    return (
        <>
            <Card
                data-testid="kanban-board"
                title={
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-brand-500" />
                            <span>Reuniões</span>
                        </div>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => handleAddToColumn('a-agendar')}
                            data-testid="new-meeting-btn"
                        >
                            Nova Reunião
                        </Button>
                    </div>
                }
                className="rounded-xl"
                styles={{ body: { padding: '16px' } }}
            >
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {COLUMNS.map((col) => {
                        const columnMeetings = getMeetingsByStatus(col.key);

                        return (
                            <div
                                key={col.key}
                                className="flex flex-col min-w-[280px] w-80 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3"
                            >
                                {/* Column header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: col.color }}
                                        />
                                        <Text strong className="text-sm">{col.title}</Text>
                                        <Tag className="rounded-full text-xs">{columnMeetings.length}</Tag>
                                    </div>
                                    <Tooltip title={`Adicionar em ${col.title}`}>
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={() => handleAddToColumn(col.key)}
                                        />
                                    </Tooltip>
                                </div>

                                {/* Meeting cards */}
                                <div className="space-y-2 flex-1 min-h-[120px]">
                                    {columnMeetings.length === 0 ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Text type="secondary" className="text-xs">
                                                Nenhuma reunião
                                            </Text>
                                        </div>
                                    ) : (
                                        columnMeetings.map((meeting) => (
                                            <div key={meeting.id}>
                                                <MeetingCard
                                                    meeting={meeting}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                />
                                                {/* Quick status change buttons */}
                                                <div className="flex gap-1 mt-1 px-1">
                                                    {COLUMNS.filter(c => c.key !== col.key).map((target) => (
                                                        <button
                                                            key={target.key}
                                                            onClick={() => handleStatusChange(meeting.id, target.key)}
                                                            className="text-[10px] px-2 py-0.5 rounded-full 
                                                                       bg-slate-200 dark:bg-slate-700 
                                                                       text-slate-600 dark:text-slate-300
                                                                       hover:bg-slate-300 dark:hover:bg-slate-600
                                                                       transition-colors"
                                                        >
                                                            → {target.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <MeetingModal
                open={modalOpen}
                onOpenChange={handleModalClose}
                initialValues={
                    editingMeeting
                        ? editingMeeting
                        : { status: addingToStatus }
                }
            />
        </>
    );
}
