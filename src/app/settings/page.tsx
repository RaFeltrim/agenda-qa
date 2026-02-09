import { useState, useEffect } from 'react';
import { Card, Typography, Switch, Space, message } from 'antd';
import { SettingOutlined, BellOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const STORAGE_KEY = 'agenda-qa-settings';

interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  compactMode: boolean;
  autoRefresh: boolean;
}

const defaultSettings: AppSettings = {
  darkMode: false,
  notifications: true,
  compactMode: false,
  autoRefresh: true,
};

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('[Settings] Failed to load from localStorage:', e);
  }
  return defaultSettings;
}

function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('[Settings] Failed to save to localStorage:', e);
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const handleToggle = (key: keyof AppSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    message.success('Configuracao atualizada');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3}>Configuracoes</Title>
          <Text type="secondary">Personalize sua experiencia</Text>
        </div>

        <Card title={<span><EyeOutlined /> Aparencia</span>}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Modo Escuro</Text>
                <br />
                <Text type="secondary">Alterar para o tema escuro</Text>
              </div>
              <Switch checked={settings.darkMode} onChange={(val) => handleToggle('darkMode', val)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Modo Compacto</Text>
                <br />
                <Text type="secondary">Reduzir espacamento entre elementos</Text>
              </div>
              <Switch checked={settings.compactMode} onChange={(val) => handleToggle('compactMode', val)} />
            </div>
          </Space>
        </Card>

        <Card title={<span><BellOutlined /> Notificacoes</span>}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Notificacoes Push</Text>
                <br />
                <Text type="secondary">Receber notificacoes de atualizacoes</Text>
              </div>
              <Switch checked={settings.notifications} onChange={(val) => handleToggle('notifications', val)} />
            </div>
          </Space>
        </Card>

        <Card title={<span><SettingOutlined /> Sistema</span>}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Atualizacao Automatica</Text>
                <br />
                <Text type="secondary">Atualizar dados automaticamente</Text>
              </div>
              <Switch checked={settings.autoRefresh} onChange={(val) => handleToggle('autoRefresh', val)} />
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
}
