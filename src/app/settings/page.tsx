import { ProForm, ProFormSwitch, ProFormSelect } from '@ant-design/pro-components';
import { Card, Typography, message, Space, Alert } from 'antd';
import { BellOutlined, FormatPainterOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function SettingsPage() {
    const [messageApi, contextHolder] = message.useMessage();

    return (
        <div className="max-w-3xl mx-auto py-8">
            {contextHolder}
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Configurações</Title>
                    <Text type="secondary">Personalize sua experiência no sistema.</Text>
                </div>

                <Alert
                    message="Sincronização Ativa"
                    description="Suas preferências são salvas automaticamente na nuvem."
                    type="info"
                    showIcon
                    closable
                />

                <ProForm
                    submitter={{
                        render: (_, dom) => <div className="flex justify-end gap-2 mt-4">{dom}</div>,
                        searchConfig: {
                            submitText: 'Salvar Preferências',
                        },
                        submitButtonProps: {
                            size: 'large',
                        },
                        resetButtonProps: {
                            style: { display: 'none' },
                        }
                    }}
                    onFinish={async (values) => {
                        await new Promise(resolve => setTimeout(resolve, 800));
                        messageApi.success('Configurações salvas!');
                        console.log(values);
                    }}
                >
                    <Card title={<Space><FormatPainterOutlined /> Aparência</Space>} className="mb-4">
                        <ProFormSelect
                            name="theme"
                            label="Tema do Sistema"
                            initialValue="system"
                            options={[
                                { label: 'Automático (Sistema)', value: 'system' },
                                { label: 'Claro', value: 'light' },
                                { label: 'Escuro', value: 'dark' },
                            ]}
                            width="md"
                        />
                        <ProFormSwitch
                            name="compactMode"
                            label="Modo Compacto"
                            tooltip="Reduz o espaçamento entre elementos nas listas."
                        />
                    </Card>

                    <Card title={<Space><BellOutlined /> Notificações</Space>} className="mb-4">
                        <ProFormSwitch
                            name="emailNotifications"
                            label="Notificações por Email"
                            initialValue={true}
                        />
                        <ProFormSwitch
                            name="pushNotifications"
                            label="Notificações Push (Navegador)"
                            initialValue={false}
                        />
                        <ProFormSwitch
                            name="marketingEmails"
                            label="Novidades e Atualizações"
                            initialValue={false}
                        />
                    </Card>

                    <Card title={<Space><GlobalOutlined /> Regional</Space>}>
                        <ProFormSelect
                            name="language"
                            label="Idioma"
                            initialValue="pt-BR"
                            options={[
                                { label: 'Português (Brasil)', value: 'pt-BR' },
                                { label: 'English (US)', value: 'en-US' },
                                { label: 'Español', value: 'es-ES' },
                            ]}
                            width="md"
                        />
                        <ProFormSelect
                            name="timezone"
                            label="Fuso Horário"
                            initialValue="america-sao_paulo"
                            options={[
                                { label: 'Brasília (GMT-3)', value: 'america-sao_paulo' },
                                { label: 'UTC', value: 'utc' },
                            ]}
                            width="md"
                        />
                    </Card>
                </ProForm>
            </Space>
        </div>
    );
}
