import React from 'react';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { HomeOutlined, UserOutlined, PlusOutlined, ShoppingOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';

const { Header } = Layout;

function AppHeader({ user, onLogout }) {
  const navigate = useNavigate();

  const userMenuItems = [
    {
      key: 'my-items',
      icon: <ShoppingOutlined />,
      label: <Link to="/my-items">我的发布</Link>,
    },
    {
      key: 'publish',
      icon: <PlusOutlined />,
      label: <Link to="/publish">发布闲置</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">管理后台</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout,
    },
  ];

  const publicMenuItems = [
    {
      key: '1',
      label: <Link to="/">首页</Link>,
      icon: <HomeOutlined />,
    },
    {
      key: '2',
      label: <Link to="/login">登录</Link>,
      icon: <UserOutlined />,
    },
    {
      key: '3',
      label: <Link to="/register">注册</Link>,
      icon: <UserOutlined />,
    },
  ];

  return (
    <Header>
      <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
        <ShoppingOutlined style={{ fontSize: '24px', marginRight: '10px' }} />
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          小区二手闲置交易系统
        </Link>
      </div>
      
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ background: 'transparent', borderBottom: 'none' }}
          >
            <Menu.Item key="1" icon={<HomeOutlined />}>
              <Link to="/" style={{ color: 'white' }}>首页</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<PlusOutlined />}>
              <Link to="/publish" style={{ color: 'white' }}>发布闲置</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<ShoppingOutlined />}>
              <Link to="/my-items" style={{ color: 'white' }}>我的发布</Link>
            </Menu.Item>
          </Menu>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: '20px' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
              <span style={{ color: 'white', marginLeft: '8px' }}>{user.username}</span>
            </div>
          </Dropdown>
        </div>
      ) : (
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
          items={publicMenuItems}
          style={{ background: 'transparent', borderBottom: 'none' }}
        />
      )}
    </Header>
  );
}

export default AppHeader;
