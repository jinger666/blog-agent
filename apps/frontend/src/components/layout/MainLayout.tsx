import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  MessageOutlined,
  BranchesOutlined,
  DatabaseOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, hideHeader }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '控制台',
    },
    {
      key: '/chat',
      icon: <MessageOutlined />,
      label: 'AI对话',
    },
    {
      key: '/workflows',
      icon: <BranchesOutlined />,
      label: '工作流',
    },
    {
      key: '/memories',
      icon: <DatabaseOutlined />,
      label: '记忆管理',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark">
        <div style={{ padding: '16px', textAlign: 'center', color: 'white' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>AI博客平台</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
        <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
          <Menu
            theme="dark"
            mode="inline"
            items={[
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: '退出登录',
                onClick: handleLogout,
              },
            ]}
          />
        </div>
      </Sider>
      <Layout>
        {!hideHeader && (
          <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>AI博客平台</h2>
          </Header>
        )}
        {hideHeader ? (
          <Content style={{ margin: 0, padding: 0 }}>
            {children}
          </Content>
        ) : (
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
            {children}
          </Content>
        )}
      </Layout>
    </Layout>
  );
};

export default MainLayout;
