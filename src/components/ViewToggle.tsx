import { Switch, Space, Typography } from 'antd';
import { CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

type ViewMode = 'reunioes' | 'tasks';

interface ViewToggleProps {
    onChange?: (mode: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ onChange }) => {
    const [mode, setMode] = useState<ViewMode>('reunioes');

    useEffect(() => {
        const saved = localStorage.getItem('viewMode') as ViewMode;
        if (saved) {
            setMode(saved);
            onChange?.(saved);
        }
    }, [onChange]);

    const handleChange = (checked: boolean) => {
        const newMode: ViewMode = checked ? 'tasks' : 'reunioes';
        setMode(newMode);
        localStorage.setItem('viewMode', newMode);
        onChange?.(newMode);
    };

    return (
        <Space>
            <CalendarOutlined />
            <Typography.Text strong>Reuniões</Typography.Text>
            <Switch
                checked={mode === 'tasks'}
                onChange={handleChange}
                checkedChildren={<CheckCircleOutlined />}
                unCheckedChildren={<CalendarOutlined />}
                size="small"
                data-testid="view-toggle-switch"
            />
            <Typography.Text strong>Tarefas</Typography.Text>
            <CheckCircleOutlined />
        </Space>
    );
};
