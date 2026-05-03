import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Tag, Button, Space, Modal, message, Image, Empty, Spin } from 'antd';
import { ExclamationCircleOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Content } = Layout;
const { confirm } = Modal;

function MyItems({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      const response = await axios.get('/api/my-items', { withCredentials: true });
      setItems(response.data);
    } catch (error) {
      message.error('获取我的发布失败');
    } finally {
      setLoading(false);
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

  const handleDelete = (id) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个商品吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await axios.delete(`/api/items/${id}`, { withCredentials: true });
          message.success('商品已删除');
          fetchMyItems();
        } catch (error) {
          message.error('删除失败，请重试');
        }
      },
    });
  };

  const columns = [
    {
      title: '商品图片',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images) => {
        if (images && images.length > 0) {
          return (
            <Image
              src={images[0]}
              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
              preview={false}
            />
          );
        }
        return <span>无图</span>;
      },
    },
    {
      title: '商品标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => navigate(`/item/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="price-tag">¥{price}</span>,
    },
    {
      title: '分类',
      dataIndex: 'category_name',
      key: 'category_name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/item/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Content style={{ padding: '24px 50px', minHeight: 'calc(100vh - 134px)' }}>
      <Card
        title={<h2 style={{ margin: 0 }}>我的发布</h2>}
        extra={
          <Button type="primary" onClick={() => navigate('/publish')}>
            发布新商品
          </Button>
        }
      >
        <Spin spinning={loading}>
          {items.length === 0 ? (
            <Empty
              description="您还没有发布任何商品"
              style={{ padding: '50px 0' }}
            >
              <Button type="primary" onClick={() => navigate('/publish')}>
                立即发布
              </Button>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={items}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          )}
        </Spin>
      </Card>
    </Content>
  );
}

export default MyItems;
