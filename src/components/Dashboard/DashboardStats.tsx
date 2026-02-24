import { Card, Statistic, Row, Col } from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import type { Card as CardType } from '../../types';
import type { Meeting } from '../../store/meetingStore';
import dayjs from 'dayjs';

interface DashboardStatsProps {
    cards: CardType[];
    meetings: Meeting[];
}

export default function DashboardStats({ cards, meetings }: DashboardStatsProps) {
    const today = dayjs().format('YYYY-MM-DD');
    const totalCards = cards.length;
    const inProgress = cards.filter(c =>
        c.status === 'in-progress' || c.status === 'em-progresso'
    ).length;
    const meetingsToday = meetings.filter(m => m.date === today).length;
    const blocked = cards.filter(c =>
        c.status === 'blocked' || c.status === 'bloqueado'
    ).length;

    const stats = [
        {
            title: 'Total de Tarefas',
            value: totalCards,
            icon: <CheckCircleOutlined />,
            color: '#4063ff',
            bg: 'bg-brand-50 dark:bg-brand-900/20',
        },
        {
            title: 'Em Progresso',
            value: inProgress,
            icon: <ClockCircleOutlined />,
            color: '#f59e0b',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
        },
        {
            title: 'Reuniões Hoje',
            value: meetingsToday,
            icon: <CalendarOutlined />,
            color: '#10b981',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        },
        {
            title: 'Bloqueados',
            value: blocked,
            icon: <ThunderboltOutlined />,
            color: '#ef4444',
            bg: 'bg-red-50 dark:bg-red-900/20',
        },
    ];

    return (
        <Row gutter={[16, 16]}>
            {stats.map((stat) => (
                <Col xs={12} sm={12} md={6} key={stat.title}>
                    <Card
                        className={`${stat.bg} border-none rounded-xl`}
                        bodyStyle={{ padding: '20px' }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                            >
                                {stat.icon}
                            </div>
                            <Statistic
                                title={<span className="text-xs text-slate-500 dark:text-slate-400">{stat.title}</span>}
                                value={stat.value}
                                valueStyle={{ fontSize: '24px', fontWeight: 700, color: stat.color }}
                            />
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}
