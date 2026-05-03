import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Select, message, Image, Popconfirm, Modal, Descriptions } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, DownOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

function AdminItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [statusFilter]);

  const fetchItems = async () => {
    try {
      const params = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await axios.get('/api/admin/items', { 
        params,
        withCredentials: true 
      });
      setItems(response.data);
    } catch (error) {
      message.error('获取商品列表失败');
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

  const handleApprove = async (id) => {
    try {
      await axios.post(`/api/admin/items/${id}/approve`, {}, { withCredentials: true });
      message.success('商品已审核通过');
      fetchItems();
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`/api/admin/items/${id}/reject`, {}, { withCredentials: true });
      message.success('商品已拒绝');
      fetchItems();
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  const handleRemove = async (id) => {
    try {
      await axios.post(`/api/admin/items/${id}/remove`, {}, { withCredentials: true });
      message.success('商品已下架');
      fetchItems();
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  const handleViewDetail = (record) => {
    setSelectedItem(record);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
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
      ellipsis: true,
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
      title: '发布者',
      dataIndex: 'owner_name',
      key: 'owner_name',
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
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="确认通过"
                description="确定要通过这个商品的审核吗？"
                onConfirm={() => handleApprove(record.id)}
                okText="确认"
                cancelText="取消"
              >
                <Button
                  type="link"
                  icon={<CheckOutlined />}
                  style={{ color: '#52c41a' }}
                >
                  通过
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确认拒绝"
                description="确定要拒绝这个商品吗？"
                onConfirm={() => handleReject(record.id)}
                okText="确认"
                cancelText="取消"
              >
                <Button
                  type="link"
                  danger
                  icon={<CloseOutlined />}
                >
                  拒绝
                </Button>
              </Popconfirm>
            </>
          )}
          {record.status === 'approved' && (
            <Popconfirm
              title="确认下架"
              description="确定要下架这个商品吗？"
              onConfirm={() => handleRemove(record.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="link"
                danger
                icon={<DownOutlined />}
              >
                下架
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={<h2 style={{ margin: 0 }}>商品管理</h2>}
        extra={
          <Select
            placeholder="筛选状态"
            allowClear
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="pending">待审核</Option>
            <Option value="approved">已上架</Option>
            <Option value="rejected">已拒绝</Option>
            <Option value="removed">已下架</Option>
          </Select>
        }
      >
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="商品详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedItem && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="商品ID">{selectedItem.id}</Descriptions.Item>
              <Descriptions.Item label="商品标题">{selectedItem.title}</Descriptions.Item>
              <Descriptions.Item label="价格">
                <span className="price-tag">¥{selectedItem.price}</span>
              </Descriptions.Item>
              <Descriptions.Item label="分类">{selectedItem.category_name}</Descriptions.Item>
              <Descriptions.Item label="发布者">{selectedItem.owner_name}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedItem.status)}>
                  {getStatusText(selectedItem.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="发布时间" span={2}>
                {selectedItem.created_at}
              </Descriptions.Item>
              <Descriptions.Item label="商品描述" span={2}>
                {selectedItem.description}
              </Descriptions.Item>
            </Descriptions>

            {selectedItem.images && selectedItem.images.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4>商品图片</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedItem.images.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 4 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminItems;
