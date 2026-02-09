import { ProForm, ProFormSwitch, ProFormSelect } from '@ant-design/pro-components';
import { Card, Typography, message, Space, Alert } from 'antd';
import { BellOutlined, FormatPainterOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SETTINGS_KEY = 'agenda-qa-settings';

function loadSettings(): Record<string, unknown> {
        try {
                    const saved = localStorage.getItem(SETTINGS_KEY);
                    return saved ? JSON.parse(saved) : {};
        } catch {
                    return {};
        }
}

function saveSettings(values: Record<string, unknown>): void {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(values));
}

export default function SettingsPage() {
        const [messageApi, contextHolder] = message.useMessage();
        const savedSettings = loadSettings();

    return (
                <div className="max-w-3xl mx-auto py-8">
                    {contextHolder}
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                            <div>
                                                                <Title level={2} style={{ margin: 0 }}>Configuracoes</Title>Title>
                                                                <Text type="secondary">Personalize sua experiencia no sistema.</Text>Text>
                                            </div>div>
                                            <Alert
                                                                    message="Persistencia Local"
                                                                    description="Suas preferencias sao salvas no navegador automaticamente."
                                                                    type="info" showIcon closable
                                                                />
                                            <ProForm
                                                                    submitter={{
                                                                                                render: (_, dom) => <div className="flex justify-end gap-2 mt-4">{dom}</div>div>,
                                                                    searchConfig: { submitText: 'Salvar Preferencias' },
                                                                    submitButtonProps: { size: 'large' },
                                                                    resetButtonProps: { style: { display: 'none' } }
                                                }}
                                                                onFinish={async (values) => {
                                                                                                saveSettings(values);
                                                                                                messageApi.success('Configuracoes salvas!');
                                                                    }}
                                                            >
                                                                <Card title={<Space><FormatPainterOutlined /> Aparencia</Space>Space>} className="mb-4">
                                                                                        <ProFormSelect name="theme" label="Tema do Sistema"
                                                                                                                        initialValue={(savedSettings.theme as string) || 'system'}
                                                                                                                        options={[
                                                                                                                            { label: 'Automatico (Sistema)', value: 'system' },
                                                                                                                            { label: 'Claro', value: 'light' },
                                                                                                                            { label: 'Escuro', value: 'dark' },
                                                                                                                                                        ]} width="md" />
                                                                                        <ProFormSwitch name="compactMode" label="Modo Compacto"
                                                                                                                        initialValue={!!savedSettings.compactMode}
                                                                                                                        tooltip="Reduz o espacamento entre elementos nas listas." />
                                                                </Card>Card>
                                                                <Card title={<Space><BellOutlined /> Notificacoes</Space>Space>} className="mb-4">
                                                                                        <ProFormSwitch name="emailNotifications" label="Notificacoes por Email"
                                                                                                                        initialValue={savedSettings.emailNotifications !== false} />
                                                                                        <ProFormSwitch name="pushNotifications" label="Notificacoes Push (Navegador)"
                                                                                                                        initialValue={!!savedSettings.pushNotifications} />
                                                                                        <ProFormSwitch name="marketingEmails" label="Novidades e Atualizacoes"
                                                                                                                        initialValue={!!savedSettings.marketingEmails} />
                                                                </Card>Card>
                                                                <Card title={<Space><GlobalOutlined /> Regional</Space>Space>}>
                                                                                        <ProFormSelect name="language" label="Idioma"
                                                                                                                        initialValue={(savedSettings.language as string) || 'pt-BR'}
                                                                                                                        options={[
                                                                                                                            { label: 'Portugues (Brasil)', value: 'pt-BR' },
                                                                                                                            { label: 'English (US)', value: 'en-US' },
                                                                                                                            { label: 'Espanol', value: 'es-ES' },
                                                                                                                                                        ]} width="md" />
                                                                                        <ProFormSelect name="timezone" label="Fuso Horario"
                                                                                                                        initialValue={(savedSettings.timezone as string) || 'america-sao_paulo'}
                                                                                                                        options={[
                                                                                                                            { label: 'Brasilia (GMT-3)', value: 'america-sao_paulo' },
                                                                                                                            { label: 'UTC', value: 'utc' },
                                                                                                                                                        ]} width="md" />
                                                                </Card>Card>
                                            </ProForm>ProForm>
                            </Space>Space>
                </div>div>
            );
}</div>
