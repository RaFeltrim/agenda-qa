import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Button, Tag, Space, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth';

const { Title, Text } = Typography;

interface UserMock {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'viewer';
    status: 'active' | 'inactive';
    lastLogin: string;
}

const mockUsers: UserMock[] = [
    {
        id: '1',
        name: 'Desenvolvedor Local',
        email: 'dev@local',
        role: 'admin',
        status: 'active',
        lastLogin: new Date().toISOString(),
    },
    {
        id: '2',
        name: 'Analista de QA',
        email: 'qa@empresa.com',
        role: 'user',
        status: 'active',
        lastLogin: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '3',
        name: 'Visitante',
        email: 'guest@empresa.com',
        role: 'viewer',
        status: 'inactive',
        lastLogin: new Date(Date.now() - 1000000000).toISOString(),
    },
];

export default function UsersPage() {
    const { user } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();

    // Guardrail: Only admin can access this page
    if (user?.user_metadata?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <Title level={4}>Acesso Negado</Title>
                <Text>Você não tem permissão para visualizar esta página.</Text>
            </div>
        );
    }

    const columns: ProColumns<UserMock>[] = [
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
                    onConfirm={() => messageApi.success('Usuário removido (Mock)')}
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

            <ProTable<UserMock>
                columns={columns}
                cardBordered
                request={async () => {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return {
                        data: mockUsers,
                        success: true,
                    };
                }}
                editable={{
                    type: 'multiple',
                    onSave: async () => {
                        await new Promise(resolve => setTimeout(resolve, 500));
                        messageApi.success('Usuário atualizado!');
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
