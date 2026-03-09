import { useState, useEffect } from 'react';
import { Card, Typography, Space, Divider, App, Skeleton, Tag } from 'antd';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { UserOutlined, LockOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user, role } = useAuth();
  const { message } = App.useApp();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [profileData, setProfileData] = useState<{ full_name: string; avatar_url: string }>({
    full_name: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setPageLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setPageLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfileData({
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (err) {
      console.warn('[Profile] Error loading profile:', err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSaveProfile = async (values: { full_name: string; avatar_url: string }) => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          avatar_url: values.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      message.success('Perfil atualizado com sucesso!');
      setProfileData({ full_name: values.full_name, avatar_url: values.avatar_url });
    } catch (error) {
      console.error(error);
      message.error('Erro ao salvar perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (values: { newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('As senhas nao coincidem');
      return;
    }
    if (values.newPassword.length < 6) {
      message.error('A senha deve ter no minimo 6 caracteres');
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      if (error) throw error;
      message.success('Senha alterada com sucesso!');
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Erro ao alterar senha';
      message.error(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3}>Meu Perfil</Title>
          <Text type="secondary">Gerencie suas informações pessoais</Text>
        </div>

        <Card>
          <Title level={5}>
            <UserOutlined /> Informações Pessoais
          </Title>
          <Divider />
          {pageLoading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <ProForm
              key={profileData.full_name}
              initialValues={profileData}
              onFinish={handleSaveProfile}
              submitter={{
                searchConfig: { submitText: 'Salvar Perfil' },
                submitButtonProps: { loading: profileLoading },
                resetButtonProps: false,
              }}
            >
              <ProFormText name="full_name" label="Nome Completo" placeholder="Seu nome completo" />
              <ProFormText name="avatar_url" label="URL do Avatar" placeholder="https://exemplo.com/avatar.jpg" />
              <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Text type="secondary"><MailOutlined /> {user?.email}</Text>
                <Tag icon={<SafetyCertificateOutlined />} color={role === 'admin' ? 'red' : role === 'user' ? 'blue' : 'default'}>
                  {role.toUpperCase()}
                </Tag>
              </div>
            </ProForm>
          )}
        </Card>

        <Card>
          <Title level={5}>
            <LockOutlined /> Alterar Senha
          </Title>
          <Divider />
          <ProForm
            onFinish={handleChangePassword}
            submitter={{
              searchConfig: { submitText: 'Alterar Senha' },
              submitButtonProps: { loading: passwordLoading, danger: true },
              resetButtonProps: false,
            }}
          >
            <ProFormText.Password
              name="newPassword"
              label="Nova Senha"
              placeholder="Minimo 6 caracteres"
              rules={[
                { required: true, message: 'Insira a nova senha' },
                { min: 6, message: 'Minimo 6 caracteres' },
              ]}
            />
            <ProFormText.Password
              name="confirmPassword"
              label="Confirmar Nova Senha"
              placeholder="Repita a nova senha"
              rules={[{ required: true, message: 'Confirme a nova senha' }]}
            />
          </ProForm>
        </Card>
      </Space>
    </div>
  );
}
