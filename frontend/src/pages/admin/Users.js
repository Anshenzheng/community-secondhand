import React, { useState, useEffect } from 'react';
import { Card, Table, message, Avatar, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import axios from 'axios';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: () => (
        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || <span style={{ color: '#999' }}>未填写</span>,
    },
    {
      title: '房号',
      dataIndex: 'room_number',
      key: 'room_number',
      render: (room_number) => room_number || <span style={{ color: '#999' }}>未填写</span>,
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
  ];

  return (
    <div>
      <Card
        title={<h2 style={{ margin: 0 }}>用户管理</h2>}
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
}

export default AdminUsers;
