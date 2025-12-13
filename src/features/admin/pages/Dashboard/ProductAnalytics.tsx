import React, { useEffect, useState, useCallback } from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Empty, Spin } from 'antd';
import { SkinOutlined, DropboxOutlined, StarFilled, FireOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import dayjs from 'dayjs';
import DateFilterHeader from './components/DateFilterHeader';

const ProductAnalyticsPage: React.FC = () => {
  const { fetchProductAnalytics, productAnalytics, isLoading } = useAnalytics();
  const [params, setParams] = useState({
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  });

  useEffect(() => {
    fetchProductAnalytics(params);
  }, [fetchProductAnalytics, params]);

  const handleFilterChange = useCallback((startDate: string, endDate: string) => {
    setParams({ startDate, endDate });
  }, []);

  if (isLoading && !productAnalytics) {
    return <div className="flex items-center justify-center h-[60vh]"><Spin size="large" /></div>;
  }

  const overview = productAnalytics?.overview;
  const categoryData = productAnalytics?.charts.productsByCategoryChart.slices || [];
  const topProducts = productAnalytics?.topProducts.byRating || []; // Or byRevenue if available

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <DateFilterHeader
        title="Số liệu Sản phẩm"
        subtitle="Phân tích hiệu suất và phân bổ sản phẩm"
        isLoading={isLoading}
        onFilterChange={handleFilterChange}
        onRefresh={() => fetchProductAnalytics(params)}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Sản phẩm Active"
              value={overview?.totalActiveProducts}
              prefix={<SkinOutlined className="text-blue-500" />}
              valueStyle={{ fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Đã bán ra"
              value={overview?.totalQuantitySold}
              prefix={<DropboxOutlined className="text-green-500" />}
              valueStyle={{ fontWeight: 'bold' }}
              suffix="sp"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Rating TB"
              value={overview?.averageRating}
              precision={1}
              prefix={<StarFilled className="text-yellow-400" />}
              valueStyle={{ fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Sản phẩm mới"
              value={overview?.newProducts}
              prefix={<FireOutlined className="text-red-500" />}
              valueStyle={{ fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card title="Phân bổ theo Danh mục" bordered={false} className="shadow-sm h-full">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <ReTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#666' }}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title="Top Sản phẩm (theo Rating)" bordered={false} className="shadow-sm h-full">
            <Table
              dataSource={topProducts.slice(0, 5)}
              rowKey="productId"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Sản phẩm',
                  key: 'name',
                  render: (_, r) => (
                    <div className="flex gap-3 items-center">
                      <img src={r.imageUrl} alt="" className="w-10 h-10 rounded object-cover border" />
                      <div className="flex flex-col">
                        <span className="font-medium line-clamp-1" title={r.productName}>{r.productName}</span>
                        <span className="text-xs text-gray-400">{r.shopName}</span>
                      </div>
                    </div>
                  )
                },
                {
                  title: 'Giá',
                  dataIndex: 'price',
                  render: (v) => <span className="font-medium">{new Intl.NumberFormat('vi-VN').format(v)}</span>
                },
                {
                  title: 'Rating',
                  dataIndex: 'rating',
                  align: 'center',
                  render: (v) => <Tag color="gold" icon={<StarFilled />}>{v}</Tag>
                },
                {
                  title: 'Tồn kho',
                  dataIndex: 'stock',
                  align: 'right',
                  render: (v) => <span className={v < 10 ? 'text-red-500 font-bold' : ''}>{v}</span>
                }
              ]}
            />
            {topProducts.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" />}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductAnalyticsPage;