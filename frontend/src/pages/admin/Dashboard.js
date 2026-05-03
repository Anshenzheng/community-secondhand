import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, message, Button } from 'antd';
import { 
  DashboardOutlined, 
  ShoppingOutlined, 
  UserOutlined, 
  TagOutlined,
  HomeOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AdminCategories from './Categories';
import AdminItems from './Items';
import AdminUsers from './Users';

const { Sider, Content } = Layout;

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalItems: 0,
    pendingItems: 0,
    approvedItems: 0,
    rejectedItems: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [itemsResponse, usersResponse] = await Promise.all([
        axios.get('/api/admin/items', { withCredentials: true }),
        axios.get('/api/admin/users', { withCredentials: true })
      ]);

      const items = itemsResponse.data;
      const pendingItems = items.filter(item => item.status === 'pending').length;
      const approvedItems = items.filter(item => item.status === 'approved').length;
      const rejectedItems = items.filter(item => item.status === 'rejected').length;

      setStats({
        totalItems: items.length,
        pendingItems,
        approvedItems,
        rejectedItems,
        totalUsers: usersResponse.data.length
      });
    } catch (error) {
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout', {}, { withCredentials: true });
      message.success('已退出登录');
      navigate('/admin/login');
    } catch (error) {
      message.error('退出登录失败');
    }
  };

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">仪表盘</Link>,
    },
    {
      key: '/admin/categories',
      icon: <TagOutlined />,
      label: <Link to="/admin/categories">分类管理</Link>,
    },
    {
      key: '/admin/items',
      icon: <ShoppingOutlined />,
      label: <Link to="/admin/items">商品管理</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link to="/admin/users">用户管理</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <a href="/">返回前台</a>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') {
      return '/admin/dashboard';
    }
    return path;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider className="admin-sidebar" width={250}>
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.1)'
        }}>
          <ShoppingOutlined style={{ fontSize: 24, color: '#fff', marginRight: 8 }} />
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>管理后台</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Content className="admin-content">
          <Routes>
            <Route path="dashboard" element={
              <div>
                <h2 style={{ marginBottom: 24 }}>仪表盘</h2>
                <Row gutter={16}>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="商品总数"
                        value={stats.totalItems}
                        prefix={<ShoppingOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="待审核"
                        value={stats.pendingItems}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="已上架"
                        value={stats.approvedItems}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="注册用户"
                        value={stats.totalUsers}
                        prefix={<UserOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>

                <Card title="快捷操作" style={{ marginTop: 24 }}>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Button 
                        type="primary" 
                        block 
                        icon={<ShoppingOutlined />}
                        onClick={() => navigate('/admin/items')}
                      >
                        商品管理
                      </Button>
                    </Col>
                    <Col span={6}>
                      <Button 
                        block 
                        icon={<TagOutlined />}
                        onClick={() => navigate('/admin/categories')}
                      >
                        分类管理
                      </Button>
                    </Col>
                    <Col span={6}>
                      <Button 
                        block 
                        icon={<UserOutlined />}
                        onClick={() => navigate('/admin/users')}
                      >
                        用户管理
                      </Button>
                    </Col>
                    <Col span={6}>
                      <Button 
                        block 
                        icon={<HomeOutlined />}
                        onClick={() => window.location.href = '/'}
                      >
                        返回前台
                      </Button>
                    </Col>
                  </Row>
                </Card>

                <Card title="系统状态" style={{ marginTop: 24 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="已拒绝/下架商品"
                        value={stats.rejectedItems}
                        prefix={<CloseCircleOutlined />}
                        valueStyle={{ color: '#ff4d4f' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="上架率"
                        value={stats.totalItems > 0 ? Math.round((stats.approvedItems / stats.totalItems) * 100) : 0}
                        suffix="%"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </div>
            } />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="items" element={<AdminItems />} />
            <Route path="users" element={<AdminUsers />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminDashboard;
