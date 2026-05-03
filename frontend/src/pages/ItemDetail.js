import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Row, Col, Card, Image, Tag, Button, Form, Input, message, Empty, Spin, Divider, List, Avatar } from 'antd';
import { ArrowLeftOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Content } = Layout;
const { TextArea } = Input;

function ItemDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchItemDetail();
    fetchMessages();
  }, [id]);

  const fetchItemDetail = async () => {
    try {
      const response = await axios.get(`/api/items/${id}`);
      setItem(response.data);
    } catch (error) {
      message.error('获取商品详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/items/${id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('获取留言失败:', error);
    }
  };

  const handleSubmitMessage = async (values) => {
    if (!user) {
      message.warning('请先登录后再留言');
      navigate('/login');
      return;
    }

    setMessageLoading(true);
    try {
      await axios.post(`/api/items/${id}/messages`, values, { withCredentials: true });
      message.success('留言成功！');
      form.resetFields();
      fetchMessages();
    } catch (error) {
      message.error(error.response?.data?.error || '留言失败，请重试');
    } finally {
      setMessageLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'gold',
      approved: 'green',
      rejected: 'red',
      removed: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: '待审核',
      approved: '已上架',
      rejected: '已拒绝',
      removed: '已下架'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <Content style={{ padding: '24px 50px', minHeight: 'calc(100vh - 134px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </Content>
    );
  }

  if (!item) {
    return (
      <Content style={{ padding: '24px 50px', minHeight: 'calc(100vh - 134px)' }}>
        <Empty description="商品不存在或已被删除" />
      </Content>
    );
  }

  return (
    <Content style={{ padding: '24px 50px', minHeight: 'calc(100vh - 134px)' }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: '16px' }}
      >
        返回
      </Button>

      <Card>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            {item.images && item.images.length > 0 ? (
              <div>
                <Image.PreviewGroup>
                  <div style={{ marginBottom: '16px' }}>
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                    />
                  </div>
                  {item.images.length > 1 && (
                    <Row gutter={8}>
                      {item.images.slice(1).map((img, index) => (
                        <Col key={index} xs={6} sm={4}>
                          <Image
                            src={img}
                            alt={`${item.title} - ${index + 2}`}
                            style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                          />
                        </Col>
                      ))}
                    </Row>
                  )}
                </Image.PreviewGroup>
              </div>
            ) : (
              <div style={{ 
                width: '100%', 
                height: '300px', 
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                暂无图片
              </div>
            )}
          </Col>
          <Col xs={24} md={12}>
            <h1 style={{ marginBottom: '16px' }}>{item.title}</h1>
            <div style={{ marginBottom: '16px' }}>
              <Tag color={getStatusColor(item.status)}>
                {getStatusText(item.status)}
              </Tag>
              <Tag className="category-tag">
                {item.category_name}
              </Tag>
            </div>
            <div className="price-tag" style={{ fontSize: '28px', marginBottom: '24px' }}>
              ¥{item.price}
            </div>
            <Divider />
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '8px' }}>商品描述</h4>
              <p style={{ color: '#666', lineHeight: '1.8' }}>
                {item.description}
              </p>
            </div>
            <Divider />
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '8px' }}>发布者信息</h4>
              <p style={{ color: '#666' }}>
                <UserOutlined style={{ marginRight: '8px' }} />
                用户名: {item.owner_name}
              </p>
              <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                发布时间: {item.created_at}
              </p>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title={<span><MessageOutlined style={{ marginRight: '8px' }} />留言咨询</span>} style={{ marginTop: '24px' }}>
        {user ? (
          <Form
            form={form}
            onFinish={handleSubmitMessage}
            layout="vertical"
          >
            <Form.Item
              name="content"
              rules={[{ required: true, message: '请输入留言内容!' }]}
            >
              <TextArea
                rows={4}
                placeholder="请输入您的咨询内容..."
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={messageLoading}>
                提交留言
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>请先登录后再留言</p>
            <Button type="primary" onClick={() => navigate('/login')}>
              去登录
            </Button>
          </div>
        )}

        <Divider />

        {messages.length === 0 ? (
          <Empty description="暂无留言" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={(message) => (
              <List.Item>
                <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <span>
                    {message.sender_name}
                    <span className="message-time">{message.created_at}</span>
                  </span>
                }
                description={message.content}
              />
            </List.Item>
            )}
          />
        )}
      </Card>
    </Content>
  );
}

export default ItemDetail;
