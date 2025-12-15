import React, { useEffect, useState, useCallback } from 'react';
import { Card, Col, Row, Statistic, Table, Avatar, Tag, Typography, Spin, Rate, Space, Empty } from 'antd';
import { 
  ShopOutlined, DollarCircleOutlined, ShoppingCartOutlined, 
  CheckCircleOutlined, CarOutlined, CloseCircleOutlined, SyncOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useAnalytics } from '@/hooks/useAnalytics';
import dayjs from 'dayjs';
import DateFilterHeader from '@/features/admin/pages/Dashboard/components/DateFilterHeader';
import { formatCurrency, StatusTag } from '@/features/admin/pages/Dashboard/components/DashboardHelpers';
import { useAuth } from '@/hooks/useAuth';

const { Title, Text } = Typography;


const VendorDashboardPage: React.FC = () => {
  const { fetchVendorDashboard, vendorDashboard, isLoading, error } = useAnalytics();
  const { currentShop } = useAuth();
  
  const [params, setParams] = useState({
    shopId: currentShop?.id || '',
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  });

  useEffect(() => {
    if (params.shopId) {
      fetchVendorDashboard(params);
    }
  }, [fetchVendorDashboard, params]);

  const handleFilterChange = useCallback((startDate: string, endDate: string) => {
    setParams(prev => ({ ...prev, startDate, endDate }));
  }, []);

  if (isLoading && !vendorDashboard) {
    return <div className="flex items-center justify-center h-[80vh]"><Spin size="large" tip="Đang tải dữ liệu cửa hàng..." /></div>;
  }

  // Destructure data
  const { shopInfo, revenueStats, orderStatistics, bestSellingProducts, recentOrders } = vendorDashboard || {}; 

  // Xử lý dữ liệu cho Pie Chart trạng thái đơn hàng
  const orderStatusData = orderStatistics ? [
    { name: 'Chờ xử lý', value: orderStatistics.pendingOrders, color: '#faad14' },
    { name: 'Đã xác nhận', value: orderStatistics.confirmedOrders, color: '#1890ff' },
    { name: 'Đang giao', value: orderStatistics.shippingOrders, color: '#722ed1' },
    { name: 'Hoàn tất', value: orderStatistics.deliveredOrders, color: '#52c41a' },
    { name: 'Đã hủy', value: orderStatistics.cancelledOrders, color: '#ff4d4f' },
  ].filter(item => item.value > 0) : [];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* 1. Header & Filter */}
      <DateFilterHeader 
        title="Tổng quan Cửa hàng" 
        subtitle="Theo dõi hiệu quả kinh doanh và vận hành"
        isLoading={isLoading}
        onFilterChange={handleFilterChange}
        onRefresh={() => fetchVendorDashboard(params)}
      />

      {/* 2. Shop Info & Key Revenue Stats */}
      <Row gutter={[16, 16]}>
        {/* Shop Profile Card */}
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm h-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div className="flex items-center gap-4">
              <Avatar shape="square" size={80} src={shopInfo?.logoUrl} icon={<ShopOutlined />} className="bg-white border-2 border-white/50" />
              <div>
                <Title level={4} className="!text-white !mb-1">{shopInfo?.shopName}</Title>
                <div className="flex items-center gap-2 text-white/90">
                  <Rate disabled defaultValue={shopInfo?.rating} className="text-yellow-300 text-sm" />
                  <span>({shopInfo?.rating} sao)</span>
                </div>
                <Text className="text-white/80 text-xs mt-1 block">ID: {shopInfo?.shopId}</Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Revenue Stats */}
        <Col xs={24} md={16}>
          <Row gutter={[16, 16]} className="h-full">
            <Col span={8}>
              <Card bordered={false} className="shadow-sm h-full flex flex-col justify-center">
                <Statistic 
                  title="Doanh thu kỳ này" 
                  value={revenueStats?.totalRevenue} 
                  precision={0}
                  prefix={<DollarCircleOutlined className="text-green-600" />}
                  suffix="₫"
                  valueStyle={{ fontWeight: 'bold', color: '#059669' }}
                />
                <div className="mt-2 text-xs text-gray-500">
                  {revenueStats?.revenueGrowthPercent !== 0 && (
                    <span className={revenueStats?.revenueGrowthPercent! > 0 ? 'text-green-500' : 'text-red-500'}>
                      {revenueStats?.revenueGrowthPercent}% 
                    </span>
                  )} so với kỳ trước
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} className="shadow-sm h-full flex flex-col justify-center">
                <Statistic 
                  title="Đơn hoàn thành" 
                  value={revenueStats?.completedOrdersCount} 
                  prefix={<CheckCircleOutlined className="text-blue-600" />}
                  valueStyle={{ fontWeight: 'bold' }}
                />
                <div className="mt-2 text-xs text-gray-500">Đơn hàng đã giao thành công</div>
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} className="shadow-sm h-full flex flex-col justify-center">
                <Statistic 
                  title="Giá trị TB/Đơn" 
                  value={revenueStats?.averageOrderValue} 
                  prefix={<ShoppingCartOutlined className="text-orange-600" />}
                  valueStyle={{ fontWeight: 'bold' }}
                  formatter={(val) => formatCurrency(Number(val))}
                />
                <div className="mt-2 text-xs text-gray-500">AOV (Average Order Value)</div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <div>
        <Title level={5} className="mb-3 text-gray-600">Tình trạng đơn hàng</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} flex="1"> 
            <Card bordered={false} className="shadow-sm text-center hover:bg-orange-50 cursor-pointer transition-colors border-b-4 border-orange-400">
              <SyncOutlined spin className="text-2xl text-orange-500 mb-2" />
              <Statistic value={orderStatistics?.pendingOrders} valueStyle={{ fontWeight: 'bold' }} />
              <Text type="secondary">Chờ xử lý</Text>
            </Card>
          </Col>
          <Col xs={24} flex="1"> 
            <Card bordered={false} className="shadow-sm text-center hover:bg-blue-50 cursor-pointer transition-colors border-b-4 border-blue-500">
              <CheckCircleOutlined className="text-2xl text-blue-500 mb-2" />
              <Statistic value={orderStatistics?.confirmedOrders} valueStyle={{ fontWeight: 'bold' }} />
              <Text type="secondary">Đã xác nhận</Text>
            </Card>
          </Col>
          <Col xs={24} flex="1"> 
            <Card bordered={false} className="shadow-sm text-center hover:bg-purple-50 cursor-pointer transition-colors border-b-4 border-purple-500">
              <CarOutlined className="text-2xl text-purple-500 mb-2" />
              <Statistic value={orderStatistics?.shippingOrders} valueStyle={{ fontWeight: 'bold' }} />
              <Text type="secondary">Đang giao</Text>
            </Card>
          </Col>
          <Col xs={24} flex="1"> 
            <Card bordered={false} className="shadow-sm text-center bg-gray-50 border-b-4 border-red-400">
              <CloseCircleOutlined className="text-2xl text-red-400 mb-2" />
              <Statistic value={orderStatistics?.cancelledOrders} valueStyle={{ fontWeight: 'bold', color: '#ff4d4f' }} />
              <Text type="secondary">Đã hủy</Text>
            </Card>
          </Col>
          <Col xs={24} flex="1">
            <Card bordered={false} className="shadow-sm text-center bg-gray-50 border-b-4 border-green-400">
              <ShoppingCartOutlined className="text-2xl text-gray-400 mb-2" />
              <Statistic value={orderStatistics?.totalOrders} valueStyle={{ fontWeight: 'bold' }} />
              <Text type="secondary">Tổng đơn</Text>
            </Card>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title={<Space><TrophyOutlined className="text-yellow-500"/> Sản phẩm bán chạy</Space>} 
            bordered={false} 
            className="shadow-sm h-full"
          >
            <Table
              dataSource={bestSellingProducts || []}
              rowKey="productId"
              pagination={false}
              size="small"
              columns={[
                {
                  title: '#',
                  dataIndex: 'rank',
                  width: 50,
                  render: (rank) => (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold
                      ${rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                      {rank}
                    </div>
                  )
                },
                {
                  title: 'Sản phẩm',
                  key: 'product',
                  render: (_, r) => (
                    <div className="flex gap-3 items-center">
                       <Avatar shape="square" size={40} src={r.productImage} className="border bg-gray-100" />
                       <Text ellipsis className="max-w-[150px] font-medium" title={r.productName}>{r.productName}</Text>
                    </div>
                  )
                },
                {
                  title: 'Đã bán',
                  dataIndex: 'totalQuantitySold',
                  align: 'center',
                  render: (v) => <Tag color="blue">{v}</Tag>
                },
                {
                  title: 'Doanh thu',
                  dataIndex: 'totalRevenue',
                  align: 'right',
                  render: (v) => <Text strong className="text-green-600">{formatCurrency(v)}</Text>
                }
              ]}
            />
            {(!bestSellingProducts || bestSellingProducts.length === 0) && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" />}
          </Card>
        </Col>

        {/* 5. Recent Orders */}
        <Col xs={24} lg={12}>
          <Card title="Đơn hàng gần đây" bordered={false} className="shadow-sm h-full">
            <Table
              dataSource={recentOrders || []}
              rowKey="orderId"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Mã đơn',
                  dataIndex: 'orderId',
                  render: (id) => <Text copyable ellipsis className="w-24 text-gray-500">{id}</Text>
                },
                {
                  title: 'Khách hàng',
                  dataIndex: 'customerName',
                  render: (name) => <span className="font-medium">{name}</span>
                },
                {
                  title: 'Tổng tiền',
                  dataIndex: 'totalAmount',
                  align: 'right',
                  render: (v) => <Text strong>{formatCurrency(v)}</Text>
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  align: 'center',
                  render: (s) => <StatusTag status={s} />
                },
                {
                  title: 'Thời gian',
                  dataIndex: 'createdAt',
                  align: 'right',
                  render: (d) => <span className="text-xs text-gray-400">{dayjs(d).format('DD/MM HH:mm')}</span>
                }
              ]}
            />
            {(!recentOrders || recentOrders.length === 0) && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" />}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VendorDashboardPage;