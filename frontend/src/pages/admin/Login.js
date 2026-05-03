import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminLogin() {
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/login', values, { withCredentials: true });
      message.success('管理员登录成功！');
      navigate('/admin/dashboard');
    } catch (error) {
      message.error(error.response?.data?.error || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card className="login-form" title={<h2 className="page-title">管理员登录</h2>}>
        <Form
          name="admin_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="管理员用户名" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="管理员密码" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              登录管理后台
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <a href="/">返回首页</a>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default AdminLogin;
