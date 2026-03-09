import { ConfigProvider, theme, Dropdown, App } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { ProLayout } from '@ant-design/pro-components';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { initializeToast } from '../lib/toast';

export default function RootLayout() {
  const { user, role, logout, loading } = useAuth();
  const [isDark] = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user && location.pathname !== '/login') {
      navigate('/login');
    }
    if (!loading && user && location.pathname === '/login') {
      navigate('/dashboard');
    }
  }, [user, loading, navigate, location]);

  if (loading) return (
    <div className={`flex items-center justify-center h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-brand-500 rounded-xl mb-4"></div>
        <div className={`h-4 w-32 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
      </div>
    </div>
  );

  if (!user) {
    return <Outlet />;
  }

  const isAdmin = role === 'admin';

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <DashboardOutlined />,
    },
    {
      path: '/profile',
      name: 'Meu Perfil',
      icon: <UserOutlined />,
    },
    {
      path: '/settings',
      name: 'Configurações',
      icon: <SettingOutlined />,
    },
    ...(isAdmin
      ? [
        {
          path: '/admin/users',
          name: 'Gestão de Usuários',
          icon: <TeamOutlined />,
        },
        ...(role === 'admin'
          ? [
            {
              path: '/ExecutiveDashboard',
              name: 'Visão Executiva',
              icon: <BarChartOutlined />,
            },
          ]
          : []),
      ]
      : []),
  ];

  // Ant Design theme configuration based on dark mode
  const themeConfig = isDark
    ? {
      algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: '#668eff',
        borderRadius: 8,
        fontFamily: "'Inter', sans-serif",
        colorBgLayout: '#0f172a',
        colorBgContainer: '#1e293b',
        colorBgElevated: '#1e293b',
        colorText: '#f1f5f9',
        colorTextSecondary: '#94a3b8',
        colorBorder: '#334155',
        colorBorderSecondary: '#1e293b',
      },
      components: {
        Card: {
          boxShadowTertiary: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
        },
        Layout: {
          bodyBg: '#0f172a',
          headerBg: '#0f172a',
          siderBg: '#0f172a',
        },
        Menu: {
          darkItemBg: '#0f172a',
          darkSubMenuItemBg: '#0f172a',
        },
      },
    }
    : {
      algorithm: theme.defaultAlgorithm,
      token: {
        colorPrimary: '#4063ff',
        borderRadius: 8,
        fontFamily: "'Inter', sans-serif",
        colorBgLayout: '#f8fafc',
      },
      components: {
        Card: {
          boxShadowTertiary: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    };

  return (
    <ConfigProvider
      locale={ptBR}
      theme={themeConfig}
    >
      <App>
        <LayoutInner
          user={user}
          role={role}
          logout={logout}
          menuItems={menuItems}
          isAdmin={isAdmin}
          isDark={isDark}
        />
      </App>
    </ConfigProvider>
  );
}

/** Inner layout that lives inside Ant App context — has access to message/notification */
function LayoutInner({
  user,
  role: _role,
  logout,
  menuItems,
  isAdmin,
  isDark,
}: {
  user: User;
  role: string;
  logout: () => Promise<void>;
  menuItems: { path: string; name: string; icon: React.ReactNode }[];
  isAdmin: boolean;
  isDark: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { message: messageApi } = App.useApp();

  // Initialize the global toast service with context-aware message API
  useEffect(() => {
    initializeToast(messageApi as any);
  }, [messageApi]);

  return (
    <ProLayout
      title="Agenda QA"
      logo={
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold">
          QA
        </div>
      }
      layout="mix"
      navTheme={isDark ? 'realDark' : 'light'}
      contentWidth="Fixed"
      fixedHeader
      fixSiderbar
      route={{ routes: menuItems }}
      location={{ pathname: location.pathname }}
      menuItemRender={(item, dom) => (
        <div
          onClick={() => navigate(item.path || '/dashboard')}
          className="flex items-center gap-2"
        >
          {dom}
        </div>
      )}
      avatarProps={{
        icon: <UserOutlined />,
        size: 'small',
        title: user?.email?.split('@')[0],
        render: (_props, dom) => {
          const dropdownItems = [
            {
              key: 'profile',
              icon: <UserOutlined />,
              label: 'Meu Perfil',
              onClick: () => navigate('/profile'),
            },
            ...(isAdmin
              ? [
                { type: 'divider' as const },
                {
                  key: 'settings',
                  icon: <SettingOutlined />,
                  label: 'Configurações',
                  onClick: () => navigate('/settings'),
                },
                {
                  key: 'users',
                  icon: <TeamOutlined />,
                  label: 'Gestão de Usuários',
                  onClick: () => navigate('/admin/users'),
                },
              ]
              : []),
            { type: 'divider' as const },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Sair',
              danger: true,
              onClick: logout,
            },
          ];
          return (
            <Dropdown menu={{ items: dropdownItems }}>
              <div className="flex items-center gap-2 px-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1 transition-all">
                {dom}
              </div>
            </Dropdown>
          );
        },
      }}
    >
      <div className="max-w-7xl mx-auto">
        <Outlet />
      </div>
    </ProLayout>
  );
}
