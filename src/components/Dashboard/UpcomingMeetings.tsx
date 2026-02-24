import { Card, Typography, Tag, Empty } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, LinkOutlined } from '@ant-design/icons';
import type { Meeting } from '../../store/meetingStore';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface UpcomingMeetingsProps {
    meetings: Meeting[];
}

/** Get meetings within the next 3 days, sorted chronologically */
function getUpcomingMeetings(meetings: Meeting[], daysAhead = 3): Meeting[] {
    const now = dayjs();
    const cutoff = now.add(daysAhead, 'day').endOf('day');

    return meetings
        .filter(m => {
            const meetingDateTime = dayjs(`${m.date} ${m.time}`);
            return meetingDateTime.isAfter(now.subtract(30, 'minute')) && meetingDateTime.isBefore(cutoff);
        })
        .sort((a, b) => {
            const dtA = dayjs(`${a.date} ${a.time}`);
            const dtB = dayjs(`${b.date} ${b.time}`);
            return dtA.diff(dtB);
        });
}

function getStatusTag(status: Meeting['status']) {
    switch (status) {
        case 'confirmada':
            return <Tag color="green">Confirmada</Tag>;
        case 'realizada':
            return <Tag color="blue">Realizada</Tag>;
        default:
            return <Tag color="orange">A Agendar</Tag>;
    }
}

function getTimeLabel(date: string, time: string): string {
    const dt = dayjs(`${date} ${time}`);
    const now = dayjs();
    const diffMin = dt.diff(now, 'minute');

    if (diffMin < 0) return 'Em andamento';
    if (diffMin < 60) return `em ${diffMin}min`;
    if (diffMin < 1440) return `em ${Math.floor(diffMin / 60)}h`;
    return dt.format('DD/MM [às] HH:mm');
}

export default function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
    const upcoming = getUpcomingMeetings(meetings);

    return (
        <Card
            title={
                <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-brand-500" />
                    <span>Próximas Reuniões</span>
                </div>
            }
            className="rounded-xl h-full"
            bodyStyle={{ padding: upcoming.length === 0 ? '24px' : '8px 16px' }}
        >
            {upcoming.length === 0 ? (
                <Empty
                    description={<Text type="secondary">Nenhuma reunião nos próximos 3 dias</Text>}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {upcoming.map((meeting) => (
                        <div
                            key={meeting.id}
                            className="group p-3 rounded-lg border border-slate-200 dark:border-slate-600 
                                       hover:border-brand-300 dark:hover:border-brand-500 
                                       hover:shadow-md transition-all cursor-pointer
                                       bg-white dark:bg-slate-800"
                            onClick={() => {
                                if (meeting.meetingLink) {
                                    window.open(meeting.meetingLink, '_blank', 'noopener,noreferrer');
                                }
                            }}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <Title
                                        level={5}
                                        className="!text-sm !mb-1 !leading-tight truncate"
                                        style={{ margin: 0 }}
                                    >
                                        {meeting.title}
                                    </Title>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <CalendarOutlined />
                                            {dayjs(meeting.date).format('DD/MM')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <ClockCircleOutlined />
                                            {meeting.time?.substring(0, 5) || '--:--'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {getStatusTag(meeting.status)}
                                    <Text type="secondary" className="!text-[10px]">
                                        {getTimeLabel(meeting.date, meeting.time)}
                                    </Text>
                                </div>
                            </div>
                            {meeting.meetingLink && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <LinkOutlined />
                                    <span>Abrir reunião</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
