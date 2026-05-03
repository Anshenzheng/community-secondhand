import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Input, Select, InputNumber, Button, Tag, Empty, Spin, Image } from 'antd';
import { SearchOutlined, FilterOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;

function Home() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category_id: undefined,
    min_price: undefined,
    max_price: undefined,
    keyword: undefined
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const fetchItems = async (searchFilters = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (searchFilters.category_id) params.category_id = searchFilters.category_id;
      if (searchFilters.min_price) params.min_price = searchFilters.min_price;
      if (searchFilters.max_price) params.max_price = searchFilters.max_price;
      if (searchFilters.keyword) params.keyword = searchFilters.keyword;

      const response = await axios.get('/api/items', { params });
      setItems(response.data);
    } catch (error) {
      console.error('获取商品列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    const newFilters = { ...filters, keyword: value || undefined };
    setFilters(newFilters);
    fetchItems(newFilters);
  };

  const handleCategoryChange = (value) => {
    const newFilters = { ...filters, category_id: value };
    setFilters(newFilters);
    fetchItems(newFilters);
  };

  const handlePriceChange = (type, value) => {
    const newFilters = { ...filters, [type]: value || undefined };
    setFilters(newFilters);
  };

  const applyPriceFilter = () => {
    fetchItems(filters);
  };

  const clearFilters = () => {
    const newFilters = {
      category_id: undefined,
      min_price: undefined,
      max_price: undefined,
      keyword: undefined
    };
    setFilters(newFilters);
    fetchItems(newFilters);
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

  return (
    <Content style={{ padding: '24px 50px', minHeight: 'calc(100vh - 134px)' }}>
      <div className="search-container">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索闲置物品..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="选择分类"
              allowClear
              style={{ width: '100%' }}
              size="large"
              value={filters.category_id}
              onChange={handleCategoryChange}
            >
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      <div className="filter-container">
        <Row gutter={16} align="middle">
          <Col>
            <FilterOutlined style={{ marginRight: '8px' }} />
            <span>价格区间：</span>
          </Col>
          <Col>
            <InputNumber
              placeholder="最低价"
              min={0}
              size="large"
              value={filters.min_price}
              onChange={(value) => handlePriceChange('min_price', value)}
            />
          </Col>
          <Col>
            <span> - </span>
          </Col>
          <Col>
            <InputNumber
              placeholder="最高价"
              min={0}
              size="large"
              value={filters.max_price}
              onChange={(value) => handlePriceChange('max_price', value)}
            />
          </Col>
          <Col>
            <Button type="primary" onClick={applyPriceFilter}>
              应用
            </Button>
          </Col>
          <Col>
            <Button onClick={clearFilters}>
              清除筛选
            </Button>
          </Col>
        </Row>
      </div>

      <Spin spinning={loading}>
        {items.length === 0 ? (
          <Empty
            description="暂无闲置物品"
            style={{ padding: '100px 0' }}
          >
            <p>快来发布第一件闲置物品吧！</p>
          </Empty>
        ) : (
          <Row gutter={[16, 16]}>
            {items.map(item => (
              <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                <Card
                  className="item-card"
                  hoverable
                  cover={
                    <div style={{ height: '200px', overflow: 'hidden' }}>
                      {item.images && item.images.length > 0 ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                          preview={false}
                        />
                      ) : (
                        <div style={{ 
                          width: '100%', 
                          height: '200px', 
                          background: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ShoppingOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                        </div>
                      )}
                    </div>
                  }
                  onClick={() => navigate(`/item/${item.id}`)}
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          maxWidth: '150px'
                        }}>
                          {item.title}
                        </span>
                        <Tag color={getStatusColor(item.status)}>
                          {getStatusText(item.status)}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div className="price-tag" style={{ marginBottom: '8px' }}>
                          ¥{item.price}
                        </div>
                        <div style={{ 
                          color: '#666',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.category_name}
                        </div>
                        <div style={{ 
                          color: '#999', 
                          fontSize: '12px',
                          marginTop: '4px'
                        }}>
                          发布者: {item.owner_name}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </Content>
  );
}

export default Home;
