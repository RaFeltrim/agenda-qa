import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Button, Tag, Space, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../services/supabase';
import { useState } from 'react';

const { Title, Text } = Typography;

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'viewer';
    status: 'active' | 'inactive';
    lastLogin: string;
}

export default function UsersPage() {
    const { role } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();
    const [actionRef, setActionRef] = useState<{ reload: () => void } | null>(null);

    // Guardrail: Only admin can access this page
    if (role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <Title level={4}>Acesso Negado</Title>
                <Text>Você não tem permissão para visualizar esta página.</Text>
            </div>
        );
    }

    const columns: ProColumns<UserProfile>[] = [
        {
            title: 'Avatar',
            dataIndex: 'name',
            hideInSearch: true,
            width: 48,
            render: (_, record) => (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {record.name.charAt(0)}
                </div>
            ),
        },
        {
            title: 'Nome',
            dataIndex: 'name',
            copyable: true,
            ellipsis: true,
            formItemProps: {
                rules: [{ required: true, message: 'Nome é obrigatório' }],
            },
        },
        {
            title: 'Email',
            dataIndex: 'email',
            copyable: true,
        },
        {
            title: 'Função',
            dataIndex: 'role',
            valueEnum: {
                admin: { text: 'Admin', status: 'Error' },
                user: { text: 'Usuário', status: 'Success' },
                viewer: { text: 'Visualizador', status: 'Default' },
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            valueEnum: {
                active: { text: 'Ativo', status: 'Processing' },
                inactive: { text: 'Inativo', status: 'Default' },
            },
            render: (_, record) => (
                <Tag color={record.status === 'active' ? 'green' : 'default'}>
                    {record.status === 'active' ? 'ATIVO' : 'INATIVO'}
                </Tag>
            ),
        },
        {
            title: 'Último Acesso',
            dataIndex: 'lastLogin',
            valueType: 'dateTime',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Ações',
            valueType: 'option',
            key: 'option',
            render: (_, record, __, action) => [
                <a key="editable" onClick={() => action?.startEditable?.(record.id)}>
                    <EditOutlined /> Editar
                </a>,
                <Popconfirm
                    key="delete"
                    title="Excluir usuário?"
                    onConfirm={async () => {
                        const { error } = await supabase
                            .from('profiles')
                            .update({ is_active: false })
                            .eq('id', record.id);
                        if (error) {
                            messageApi.error('Erro ao desativar usuário');
                        } else {
                            messageApi.success('Usuário desativado');
                            actionRef?.reload();
                        }
                    }}
                >
                    <a className="text-red-500">
                        <DeleteOutlined /> Excluir
                    </a>
                </Popconfirm>,
            ],
        },
    ];

    return (
        <div className="py-6">
            {contextHolder}
            <div className="mb-6">
                <Title level={2} style={{ margin: 0 }}>Gestão de Usuários</Title>
                <Text type="secondary">Administre o acesso e as permissões da equipe.</Text>
            </div>

            <ProTable<UserProfile>
                columns={columns}
                cardBordered
                actionRef={(ref) => setActionRef(ref as { reload: () => void })}
                request={async (params) => {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('id, full_name, email, role, is_active, updated_at')
                        .order('updated_at', { ascending: false });

                    if (error) {
                        messageApi.error('Erro ao carregar usuários');
                        return { data: [], success: false };
                    }

                    const users: UserProfile[] = (data || []).map((p: Record<string, unknown>) => ({
                        id: p.id as string,
                        name: (p.full_name as string) || 'Sem nome',
                        email: (p.email as string) || '',
                        role: (p.role as UserProfile['role']) || 'viewer',
                        status: (p.is_active ? 'active' : 'inactive') as UserProfile['status'],
                        lastLogin: (p.updated_at as string) || new Date().toISOString(),
                    }));

                    // Apply search filters
                    let filtered = users;
                    if (params.name) {
                        filtered = filtered.filter((u) => u.name.toLowerCase().includes(params.name.toLowerCase()));
                    }
                    if (params.email) {
                        filtered = filtered.filter((u) => u.email.toLowerCase().includes(params.email.toLowerCase()));
                    }

                    return {
                        data: filtered,
                        success: true,
                    };
                }}
                editable={{
                    type: 'multiple',
                    onSave: async (key, record) => {
                        const updates: Record<string, unknown> = {};
                        if (record.name) updates.full_name = record.name;
                        if (record.role) updates.role = record.role;

                        const { error } = await supabase
                            .from('profiles')
                            .update(updates)
                            .eq('id', key);

                        if (error) {
                            messageApi.error('Erro ao atualizar usuário');
                        } else {
                            messageApi.success('Usuário atualizado!');
                        }
                    },
                }}
                columnsState={{
                    persistenceKey: 'pro-table-singe-demos',
                    persistenceType: 'localStorage',
                }}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                }}
                pagination={{
                    pageSize: 5,
                    onChange: (page) => console.log(page),
                }}
                dateFormatter="string"
                headerTitle={
                    <Space>
                        <UserOutlined />
                        <span>Lista de Membros</span>
                    </Space>
                }
                toolBarRender={() => [
                    <Button key="button" icon={<PlusOutlined />} type="primary">
                        Novo Usuário
                    </Button>,
                ]}
            />
        </div>
    );
}
