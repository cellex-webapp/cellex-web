import React, { useEffect, useState, useCallback } from 'react';
import { Card, Col, Row, Statistic, List, Avatar, Typography, Spin } from 'antd';
import { ShopOutlined, DollarCircleOutlined, StarOutlined, AppstoreOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import dayjs from 'dayjs';
import DateFilterHeader from './components/DateFilterHeader';

const { Text } = Typography;

const ShopAnalyticsPage: React.FC = () => {
  const { fetchShopAnalytics, shopAnalytics, isLoading } = useAnalytics();
  const [params, setParams] = useState({
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  });

  useEffect(() => {
    fetchShopAnalytics(params);
  }, [fetchShopAnalytics, params]);

  const handleFilterChange = useCallback((startDate: string, endDate: string) => {
    setParams({ startDate, endDate });
  }, []);

  if (isLoading && !shopAnalytics) {
    return <div className="flex items-center justify-center h-[60vh]"><Spin size="large" /></div>;
  }

  const overview = shopAnalytics?.overview;
  const revenueChartData = shopAnalytics?.charts.revenueChart.data || [];
  const topShops = shopAnalytics?.topShops.byRevenue || [];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <DateFilterHeader
        title="Số liệu Cửa hàng"
        subtitle="Phân tích hiệu suất và doanh thu của cửa hàng"
        isLoading={isLoading}
        onFilterChange={handleFilterChange}
        onRefresh={() => fetchShopAnalytics(params)}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Tổng doanh thu"
              value={overview?.totalRevenue}
              precision={0}
              prefix={<DollarCircleOutlined className="text-green-600" />}
              valueStyle={{ fontWeight: 'bold', color: '#059669' }}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Cửa hàng hoạt động"
              value={overview?.activeShops}
              prefix={<ShopOutlined className="text-blue-500" />}
              valueStyle={{ fontWeight: 'bold' }}
              suffix={`/ ${overview?.totalShops}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Đánh giá trung bình"
              value={overview?.averageShopRating}
              precision={1}
              prefix={<StarOutlined className="text-yellow-500" />}
              valueStyle={{ fontWeight: 'bold' }}
              suffix="sao"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="SP trung bình / Shop"
              value={overview?.averageProductsPerShop}
              precision={0}
              prefix={<AppstoreOutlined className="text-purple-500" />}
              valueStyle={{ fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Doanh thu từ Cửa hàng" bordered={false} className="shadow-sm h-full">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRevShop" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} dy={10} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} fontSize={12} />
                  <ReTooltip
                    formatter={(val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevShop)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Top 5 Doanh Thu" bordered={false} className="shadow-sm h-full">
            <List
              itemLayout="horizontal"
              dataSource={topShops.slice(0, 5)}
              renderItem={(item, index) => (
                <List.Item className="!px-0 border-b last:border-0">
                  <List.Item.Meta
                    avatar={
                      <div className="relative">
                        <Avatar src={item.logoUrl} shape="square" size={48} className="bg-gray-100 border" />
                        <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold
                          ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-300'}`}>
                          {index + 1}
                        </div>
                      </div>
                    }
                    title={<span className="font-semibold text-gray-800">{item.shopName}</span>}
                    description={
                      <div className="flex flex-col gap-1">
                        <Text type="secondary" className="text-xs">{item.orderCount} đơn hàng</Text>
                        <div className="flex items-center gap-1">
                          <StarOutlined className="text-yellow-400 text-xs" /> <span className="text-xs text-gray-500">{item.rating}</span>
                        </div>
                      </div>
                    }
                  />
                  <div className="font-bold text-green-600">
                    {new Intl.NumberFormat('vi-VN', { compactDisplay: "short", notation: "compact" }).format(item.revenue)}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ShopAnalyticsPage;