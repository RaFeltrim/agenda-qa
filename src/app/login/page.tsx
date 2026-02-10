import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { App, Tabs, ConfigProvider, Typography, Modal, Input } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function LoginPage() {
  return (
    <ConfigProvider locale={ptBR}>
      <App>
        <LoginPageInner />
      </App>
    </ConfigProvider>
  );
}

function LoginPageInner() {
  const { login, signup, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [loginType, setLoginType] = useState<string>('login');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
      message.success('Bem-vindo de volta!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Falha no login';
      message.error(msg);
    }
  };

  const handleSignup = async (values: { email: string; password: string; confirmPassword?: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error('As senhas nao coincidem');
      return;
    }
    try {
      await signup(values.email, values.password);
      message.success('Conta criada! Verifique seu email para confirmar.');
      setLoginType('login');
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Falha no cadastro';
      message.error(msg);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      message.error('Insira seu email');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      message.success('Email de recuperacao enviado! Verifique sua caixa de entrada.');
      setResetModalOpen(false);
      setResetEmail('');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao enviar email';
      message.error(msg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-100 rounded-full blur-3xl opacity-50"></div>

        <div className="z-10 w-full max-w-[440px] px-6 py-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-premium rotate-3 hover:rotate-0 transition-transform duration-300">
              QA
            </div>
            <Title level={2} className="!mb-2">Agenda QA</Title>
            <Text type="secondary" className="text-base">Mantenha seu fluxo de trabalho sincronizado</Text>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100">
            <Tabs
              activeKey={loginType}
              onChange={(key) => setLoginType(key)}
              centered
              className="mb-6 flex"
              items={[
                { key: 'login', label: 'Login' },
                { key: 'signup', label: 'Cadastro' }
              ]}
            />

            {loginType === 'login' ? (
              <LoginForm
                onFinish={handleLogin}
                submitter={{
                  searchConfig: { submitText: 'Acessar Plataforma' },
                  submitButtonProps: {
                    size: 'large',
                    className: 'h-12 w-full rounded-xl font-semibold mt-4',
                    'data-testid': 'login-submit-button',
                  } as any,
                }}
              >
                <ProFormText
                  name="email"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined className="text-slate-400" />,
                    className: 'rounded-xl h-11',
                    'data-testid': 'login-email-input'
                  } as any}
                  placeholder="Email institucional"
                  rules={[{ required: true, message: 'Insira seu email' }]}
                />
                <ProFormText.Password
                  name="password"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined className="text-slate-400" />,
                    className: 'rounded-xl h-11',
                    'data-testid': 'login-password-input'
                  } as any}
                  placeholder="Sua senha"
                  rules={[{ required: true, message: 'Insira sua senha' }]}
                />
                <div className="flex justify-between items-center mb-4 px-1">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(true)}
                    className="text-brand-500 hover:underline text-xs bg-transparent border-none cursor-pointer"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              </LoginForm>
            ) : (
              <LoginForm
                onFinish={handleSignup}
                submitter={{
                  searchConfig: { submitText: 'Criar Conta' },
                  submitButtonProps: {
                    size: 'large',
                    className: 'h-12 w-full rounded-xl font-semibold mt-4',
                    'data-testid': 'signup-submit-button',
                  } as any,
                }}
              >
                <ProFormText
                  name="email"
                  fieldProps={{
                    size: 'large',
                    prefix: <MailOutlined className="text-slate-400" />,
                    className: 'rounded-xl h-11',
                  } as any}
                  placeholder="Seu email"
                  rules={[
                    { required: true, message: 'Insira seu email' },
                    { type: 'email', message: 'Email invalido' }
                  ]}
                />
                <ProFormText.Password
                  name="password"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined className="text-slate-400" />,
                    className: 'rounded-xl h-11',
                  } as any}
                  placeholder="Criar senha (min. 6 caracteres)"
                  rules={[
                    { required: true, message: 'Insira uma senha' },
                    { min: 6, message: 'Minimo 6 caracteres' }
                  ]}
                />
                <ProFormText.Password
                  name="confirmPassword"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined className="text-slate-400" />,
                    className: 'rounded-xl h-11',
                  } as any}
                  placeholder="Confirmar senha"
                  rules={[{ required: true, message: 'Confirme sua senha' }]}
                />
              </LoginForm>
            )}
          </div>
        </div>

        <Modal
          title="Recuperar Senha"
          open={resetModalOpen}
          onCancel={() => { setResetModalOpen(false); setResetEmail(''); }}
          onOk={handleResetPassword}
          confirmLoading={resetLoading}
          okText="Enviar Email"
          cancelText="Cancelar"
        >
          <div className="py-4">
            <Text type="secondary" className="block mb-4">
              Insira seu email e enviaremos um link para redefinir sua senha.
            </Text>
            <Input
              size="large"
              prefix={<MailOutlined className="text-slate-400" />}
              placeholder="Seu email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              onPressEnter={handleResetPassword}
            />
          </div>
        </Modal>
      </div>
  );
}
