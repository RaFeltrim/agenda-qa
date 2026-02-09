import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Card, Typography, message, Divider, Space, Button } from 'antd';
import { UserOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';

const { Title, Text } = Typography;

export default function ProfilePage() {
        const { user } = useAuth();
        const [messageApi, contextHolder] = message.useMessage();

    const handleSaveProfile = async (values: {
                name?: string;
                oldPassword?: string;
                newPassword?: string;
    }) => {
                try {
                                // Update profile name in profiles table
                    if (values.name && user?.id) {
                                        const { error: profileError } = await supabase
                                            .from('profiles')
                                            .update({
                                                                        full_name: values.name,
                                                                        username: values.name.toLowerCase().replace(/\s+/g, '_'),
                                            })
                                            .eq('id', user.id);

                                    if (profileError) {
                                                            messageApi.error(`Erro ao atualizar perfil: ${profileError.message}`);
                                                            return;
                                    }
                    }

                    // Update password if provided
                    if (values.newPassword) {
                                        if (!values.oldPassword) {
                                                                messageApi.error('Insira a senha atual para alterar a senha.');
                                                                return;
                                        }
                                        if (values.newPassword.length < 6) {
                                                                messageApi.error('A nova senha deve ter no mínimo 6 caracteres.');
                                                                return;
                                        }

                                    // Verify old password by trying to sign in
                                    const { error: signInError } = await supabase.auth.signInWithPassword({
                                                            email: user?.email || '',
                                                            password: values.oldPassword,
                                    });

                                    if (signInError) {
                                                            messageApi.error('Senha atual incorreta.');
                                                            return;
                                    }

                                    // Update password
                                    const { error: passwordError } = await supabase.auth.updateUser({
                                                            password: values.newPassword,
                                    });

                                    if (passwordError) {
                                                            messageApi.error(`Erro ao alterar senha: ${passwordError.message}`);
                                                            return;
                                    }
                    }

                    messageApi.success('Perfil atualizado com sucesso!');
                } catch (error) {
                                console.error('Profile update error:', error);
                                messageApi.error('Erro inesperado ao atualizar perfil.');
                }
    };

    return (
                <div className="max-w-3xl mx-auto py-8">
                    {contextHolder}
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                            <div>
                                                                <Title level={2} style={{ margin: 0 }}>Meu Perfil</Title>Title>
                                                                <Text type="secondary">Gerencie suas informações pessoais e segurança.</Text>Text>
                                            </div>div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                <Card className="md:col-span-1 text-center" bordered={false}>
                                                                                        <div className="mb-4 flex justify-center">
                                                                                                                    <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center text-brand-500 text-3xl font-bold border-4 border-white shadow-soft">
                                                                                                                        {user?.email?.charAt(0).toUpperCase() || <UserOutlined />}
                                                                                                                        </div>div>
                                                                                            </div>div>
                                                                                        <Title level={4}>{user?.email?.split('@')[0]}</Title>Title>
                                                                                        <Text type="secondary">{user?.email}</Text>Text>
                                                                                        <Divider />
                                                                                        <Button disabled>Alterar Foto (Em breve)</Button>Button>
                                                                </Card>Card>
                                                                <Card className="md:col-span-2" bordered={false} title="Informações Básicas">
                                                                                        <ProForm
                                                                                                                        submitter={{
                                                                                                                                                            searchConfig: { submitText: 'Salvar Alterações' },
                                                                                                                                                            submitButtonProps: {
                                                                                                                                                                                                    icon: <SaveOutlined />,
                                                                                                                                                                                                    size: 'large',
                                                                                                                                                                                                    className: 'w-full md:w-auto',
                                                                                                                                                                },
                                                                                                                                                            resetButtonProps: { style: { display: 'none' } },
                                                                                                                            }}
                                                                                                                        onFinish={handleSaveProfile}
                                                                                                                    >
                                                                                                                    <ProFormText
                                                                                                                                                        name="name"
                                                                                                                                                        label="Nome Completo"
                                                                                                                                                        placeholder="Seu nome"
                                                                                                                                                        initialValue={user?.user_metadata?.name || user?.email?.split('@')[0] || ''}
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
                                                                                                                    <Divider orientation="left">Segurança</Divider>Divider>
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
                                                                                            </ProForm>ProForm>
                                                                </Card>Card>
                                            </div>div>
                            </Space>Space>
                </div>div>
            );
}</div>
