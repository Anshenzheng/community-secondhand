import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register({ onLogin }) {
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/register', values, { withCredentials: true });
      message.success('注册成功！');
      
      const loginResponse = await axios.post('/api/login', {
        username: values.username,
        password: values.password
      }, { withCredentials: true });
      
      onLogin(loginResponse.data.user);
      navigate('/');
    } catch (error) {
      message.error(error.response?.data?.error || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px 0', background: '#f5f5f5', minHeight: 'calc(100vh - 134px)' }}>
      <Card className="register-form" title={<h2 className="page-title">用户注册</h2>}>
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 2, message: '用户名至少2个字符!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, message: '密码至少6个字符!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" size="large" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码!' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="手机号码（选填）" size="large" />
          </Form.Item>

          <Form.Item
            name="room_number"
          >
            <Input prefix={<HomeOutlined />} placeholder="房号（如：1栋101室）" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            已有账号？ <Link to="/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Register;
