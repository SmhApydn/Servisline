import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  EnvironmentOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import './App.css';
import Login from './Login';
import ServiceRoutesTable from './components/ServiceRoutesTable';
import UsersTable from './components/UsersTable';
import logo from './assets/servisline-logo.png';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/routes', icon: <EnvironmentOutlined />, label: 'Servis Rotaları' },
  { key: '/users', icon: <UserOutlined />, label: 'Kullanıcılar' },
  { key: '/notifications', icon: <NotificationOutlined />, label: 'Bildirimler' },
];

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', margin: 0, padding: 0 }}>
      <Layout style={{ minHeight: '100vh', width: '100vw', margin: 0, padding: 0 }}>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={220} style={{ minHeight: '100vh', margin: 0, padding: 0 }}>
          <div style={{
            height: 80,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
          }}>
            <img src={logo} alt="ServisLine Logo" style={{ maxHeight: 48, maxWidth: '100%' }} />
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
            items={menuItems}
          />
        </Sider>
        <Layout style={{ minHeight: '100vh', background: '#fff', margin: 0, padding: 0 }}>
          <Header style={{
            background: '#fff',
            padding: '0 24px',
            textAlign: 'left',
            fontWeight: 'bold',
            fontSize: 22,
            boxShadow: '0 2px 8px #f0f1f2',
            margin: 0
          }}>
            Yönetim Paneli
          </Header>
          <Content style={{
            margin: 0,
            padding: 24,
            background: '#fff',
            minHeight: 'calc(100vh - 64px)',
            width: '100%',
            overflow: 'auto',
            boxSizing: 'border-box',
          }}>
            <Routes>
              <Route path="/dashboard" element={<h2>Dashboard</h2>} />
              <Route path="/routes" element={<ServiceRoutesTable />} />
              <Route path="/users" element={<UsersTable />} />
              <Route path="/notifications" element={<h2>Bildirim Yönetimi</h2>} />
              <Route path="/" element={<h2>Dashboard</h2>} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default App;
