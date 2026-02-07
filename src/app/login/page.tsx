import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { LockOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { message, Tabs, ConfigProvider, Typography } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loginType, setLoginType] = useState<string>('account');

    const handleSubmit = async (values: { email: string; password: string }) => {
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

    return (
        <ConfigProvider locale={ptBR}>
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden">
                {/* Decorative Elements */}
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
                        <LoginForm
                            onFinish={handleSubmit}
                            submitter={{
                                searchConfig: {
                                    submitText: 'Acessar Plataforma',
                                },
                                submitButtonProps: {
                                    size: 'large',
                                    className: 'h-12 w-full rounded-xl font-semibold mt-4',
                                    'data-testid': 'login-submit-button',
                                } as any,
                            }}
                        >
                            <Tabs
                                activeKey={loginType}
                                onChange={(key) => setLoginType(key)}
                                centered
                                className="mb-6 flex"
                                items={[{ key: 'account', label: 'Login Institucional' }]}
                            />

                            {import.meta.env.VITE_USE_MOCK_AUTH === 'true' && (
                                <div className="mb-6 p-4 bg-brand-50 rounded-2xl border border-brand-100 text-center group cursor-pointer hover:bg-brand-100 transition-colors"
                                    onClick={() => {
                                        login('dev@local', '123').then(() => {
                                            message.success('Acesso de desenvolvedor concedido');
                                            navigate('/dashboard');
                                        });
                                    }}>
                                    <span className="text-brand-600 text-xs font-bold block mb-1">MOCK AUTH DISPONÍVEL</span>
                                    <span className="text-brand-800 text-sm font-medium flex items-center justify-center gap-2">
                                        Entrar como Dev <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            )}

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
                                <Text type="secondary" className="text-xs">
                                    Dúvidas? <a className="text-brand-500 hover:underline">Suporte TI</a>
                                </Text>
                            </div>
                        </LoginForm>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
}
