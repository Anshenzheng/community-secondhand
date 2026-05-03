import React, { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Select, InputNumber, Upload, Button, message, Row, Col } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
  if (!isJpgOrPng) {
    message.error('只能上传 JPG、PNG 或 GIF 格式的图片!');
  }
  const isLt2M = file.size / 1024 / 1024 < 16;
  if (!isLt2M) {
    message.error('图片大小不能超过 16MB!');
  }
  return isJpgOrPng && isLt2M;
}

function PublishItem({ user }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      message.error('获取分类失败');
    }
  };

  const handleImageChange = (info) => {
    if (info.file.status === 'uploading') {
      setImageLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, () => {
        setImageLoading(false);
      });
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('price', values.price);
      formData.append('category_id', values.category_id);

      fileList.forEach((file, index) => {
        formData.append('images', file.originFileObj);
      });

      const response = await axios.post('/api/items', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success('商品发布成功，等待审核！');
      navigate('/my-items');
    } catch (error) {
      message.error(error.response?.data?.error || '发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );

  return (
    <Content style={{ padding: '24px 50px', minHeight: 'calc(100vh - 134px)' }}>
      <Card title={<h2 style={{ margin: 0 }}>发布闲置物品</h2>}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            price: 0,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="title"
                label="商品标题"
                rules={[
                  { required: true, message: '请输入商品标题!' },
                  { max: 100, message: '标题不能超过100个字符!' }
                ]}
              >
                <Input placeholder="请输入商品标题" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="category_id"
                label="商品分类"
                rules={[{ required: true, message: '请选择商品分类!' }]}
              >
                <Select placeholder="请选择分类" size="large">
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="price"
                label="价格 (元)"
                rules={[
                  { required: true, message: '请输入价格!' },
                  { type: 'number', min: 0, message: '价格不能为负数!' }
                ]}
              >
                <InputNumber
                  placeholder="请输入价格"
                  size="large"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  prefix="¥"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="商品描述"
            rules={[
              { required: true, message: '请输入商品描述!' },
              { min: 10, message: '描述至少10个字符!' }
            ]}
          >
            <TextArea
              rows={6}
              placeholder="请详细描述您的商品信息，包括新旧程度、使用情况等..."
            />
          </Form.Item>

          <Form.Item
            label="商品图片"
            rules={[{ required: true, message: '请至少上传一张商品图片!' }]}
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleImageChange}
              onRemove={(file) => {
                const index = fileList.indexOf(file);
                const newFileList = fileList.slice();
                newFileList.splice(index, 1);
                setFileList(newFileList);
              }}
              beforeUpload={() => false}
              customRequest={({ file, onSuccess }) => {
                setTimeout(() => {
                  onSuccess('ok');
                }, 0);
              }}
            >
              {fileList.length >= 5 ? null : uploadButton}
            </Upload>
            <div style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
              最多上传5张图片，支持 JPG、PNG、GIF 格式，单张图片不超过 16MB
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              发布商品
            </Button>
            <Button 
              style={{ marginLeft: '16px' }} 
              size="large"
              onClick={() => navigate(-1)}
            >
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Content>
  );
}

export default PublishItem;
