import { KanbanBoard } from '../../components/KanbanBoard';
import { TaskBoard } from '../../components/TaskBoard';
import { ViewToggle } from '../../components/ViewToggle';
import { Space, Typography } from 'antd';
import { useState } from 'react';

const { Title, Text } = Typography;

export default function DashboardPage() {
    const [view, setView] = useState<'reunioes' | 'tasks'>('reunioes');

    return (
        <div className="py-6 min-h-screen">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                    <div>
                        <Title level={2} style={{ margin: 0 }}>Portal de Governança</Title>
                        <Text type="secondary">Gerencie suas reuniões e fluxos de tarefas em um só lugar.</Text>
                    </div>
                    <div className="bg-white p-1 rounded-xl shadow-soft border border-slate-100">
                        <ViewToggle onChange={setView} />
                    </div>
                </div>

                {view === 'reunioes' ? (
                    <KanbanBoard />
                ) : (
                    <TaskBoard />
                )}
            </Space>
        </div>
    );
}
