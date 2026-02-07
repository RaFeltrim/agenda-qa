import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Card, Typography, message, Divider, Space, Button } from 'antd';
import { UserOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

export default function ProfilePage() {
    const { user } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();

    return (
        <div className="max-w-3xl mx-auto py-8">
            {contextHolder}
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Meu Perfil</Title>
                    <Text type="secondary">Gerencie suas informações pessoais e segurança.</Text>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Cartão de Avatar (Coluna 1) */}
                    <Card className="md:col-span-1 text-center" bordered={false}>
                        <div className="mb-4 flex justify-center">
                            <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center text-brand-500 text-3xl font-bold border-4 border-white shadow-soft">
                                {user?.email?.charAt(0).toUpperCase() || <UserOutlined />}
                            </div>
                        </div>
                        <Title level={4}>{user?.email?.split('@')[0]}</Title>
                        <Text type="secondary">{user?.email}</Text>

                        <Divider />

                        <Button disabled>Alterar Foto (Em breve)</Button>
                    </Card>

                    {/* Formulário de Dados (Coluna 2 e 3) */}
                    <Card className="md:col-span-2" bordered={false} title="Informações Básicas">
                        <ProForm
                            submitter={{
                                searchConfig: {
                                    submitText: 'Salvar Alterações',
                                },
                                submitButtonProps: {
                                    icon: <SaveOutlined />,
                                    size: 'large',
                                    className: 'w-full md:w-auto',
                                },
                                resetButtonProps: {
                                    style: { display: 'none' },
                                },
                            }}
                            onFinish={async (values) => {
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                messageApi.success('Perfil atualizado com sucesso!');
                                console.log(values);
                            }}
                        >
                            <ProFormText
                                name="name"
                                label="Nome Completo"
                                placeholder="Seu nome"
                                initialValue={user?.user_metadata?.name || ''}
                                fieldProps={{ size: 'large' }}
                            />
                            <ProFormText
                                name="email"
                                label="Email"
                                disabled
                                initialValue={user?.email}
                                fieldProps={{ size: 'large' }}
                                tooltip="O email não pode ser alterado."
                            />

                            <Divider orientation="left">Segurança</Divider>

                            <ProFormText.Password
                                name="oldPassword"
                                label="Senha Atual"
                                placeholder="Digitar senha atual"
                            />
                            <ProFormText.Password
                                name="newPassword"
                                label="Nova Senha"
                                placeholder="Nova senha segura"
                                rules={[
                                    { min: 6, message: 'A senha deve ter no mínimo 6 caracteres' }
                                ]}
                            />
                        </ProForm>
                    </Card>
                </div>
            </Space>
        </div>
    );
}
