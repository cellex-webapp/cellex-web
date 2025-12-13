import React, { useEffect, useState, useCallback } from 'react';
import { Card, Col, Row, Statistic, Table, Avatar, Tag, Spin, Empty } from 'antd';
import { 
  UserOutlined, UserAddOutlined, TeamOutlined, RiseOutlined 
} from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import dayjs from 'dayjs';
import DateFilterHeader from './components/DateFilterHeader';

const SEGMENT_COLORS: Record<string, string> = {
  'VIP': '#FFB020',          
  'Thường xuyên': '#36B37E',  
  'Mới': '#3366FF',           
  'Không hoạt động': '#8B8D97', 
  'Chưa mua hàng': '#8B8D97'
};
const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B8D97'];

const CustomerAnalyticsPage: React.FC = () => {
  const { fetchCustomerAnalytics, customerAnalytics, isLoading } = useAnalytics();
  const [params, setParams] = useState({
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  });

  useEffect(() => {
    fetchCustomerAnalytics(params);
  }, [fetchCustomerAnalytics, params]);

  const handleFilterChange = useCallback((startDate: string, endDate: string) => {
    setParams({ startDate, endDate });
  }, []);

  if (isLoading && !customerAnalytics) {
    return <div className="flex items-center justify-center h-[60vh]"><Spin size="large" /></div>;
  }

  const overview = customerAnalytics?.overview;
  
  const rawSegments = customerAnalytics?.charts.customerSegmentChart.slices || [];
  const segments = rawSegments.map(item => ({
    ...item,
    value: Number(item.value) || 0, 
    color: item.color || SEGMENT_COLORS[item.label] || DEFAULT_COLORS[0] 
  }));

  const spendingData = customerAnalytics?.charts.customerSpendingChart.data || [];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <DateFilterHeader 
        title="Số liệu Khách hàng" 
        subtitle="Phân tích hành vi và phân khúc khách hàng"
        isLoading={isLoading}
        onFilterChange={handleFilterChange}
        onRefresh={() => fetchCustomerAnalytics(params)}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic 
              title="Tổng khách hàng" 
              value={overview?.totalCustomers} 
              prefix={<TeamOutlined className="text-blue-500"/>} 
              valueStyle={{ fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic 
              title="Khách hàng mới" 
              value={overview?.newCustomers} 
              prefix={<UserAddOutlined className="text-green-500"/>}
              valueStyle={{ fontWeight: 'bold' }} 
              suffix={
                <Tag color={overview?.newCustomersChange! >= 0 ? 'green' : 'red'}>
                  {overview?.newCustomersChange}%
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic 
              title="Khách hàng hoạt động" 
              value={overview?.activeCustomers} 
              prefix={<UserOutlined className="text-purple-500"/>}
              valueStyle={{ fontWeight: 'bold' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic 
              title="Giá trị trung bình (LTV)" 
              value={overview?.averageCustomerValue} 
              precision={0}
              prefix={<RiseOutlined className="text-orange-500"/>}
              valueStyle={{ fontWeight: 'bold' }} 
              formatter={(val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val))}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Xu hướng chi tiêu khách hàng" bordered={false} className="shadow-sm h-full">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingData}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} dy={10} fontSize={12} tick={{fill: '#666'}}/>
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} fontSize={12} tick={{fill: '#666'}}/>
                  <ReTooltip 
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Phân khúc khách hàng" bordered={false} className="shadow-sm h-full">
            <div className="h-[320px] w-full relative">
              {segments.length > 0 && segments.some(s => s.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segments}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="label" 
                    >
                      {segments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip 
                      formatter={(value: number, name: string) => [value, name]}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-gray-600 ml-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <Empty description="Chưa có dữ liệu phân khúc" />
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 4. Recent Customers Table (Giữ nguyên) */}
      <Row>
        <Col span={24}>
          <Card title="Khách hàng mới đăng ký" bordered={false} className="shadow-sm">
            <Table 
              dataSource={customerAnalytics?.recentCustomers || []} 
              rowKey="userId"
              pagination={false}
              columns={[
                {
                  title: 'Khách hàng',
                  key: 'user',
                  render: (_, r) => (
                    <div className="flex items-center gap-3">
                      <Avatar src={r.avatarUrl} style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}>
                        {r.fullName?.charAt(0) || 'U'}
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{r.fullName}</span>
                        <span className="text-xs text-gray-400">{r.email}</span>
                      </div>
                    </div>
                  )
                },
                {
                  title: 'Ngày tham gia',
                  dataIndex: 'createdAt',
                  render: (d) => dayjs(d).format('DD/MM/YYYY HH:mm')
                },
                {
                  title: 'Trạng thái',
                  key: 'status',
                  render: () => <Tag color="green">Active</Tag> 
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerAnalyticsPage;