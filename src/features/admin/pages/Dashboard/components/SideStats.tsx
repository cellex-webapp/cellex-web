import React from 'react';
import { Card, List, Avatar, Progress, Space, Typography, Empty } from 'antd';
import { formatCurrency } from './DashboardHelpers';

const { Text, Title } = Typography;

export const OrderStatusCard: React.FC<{ data?: IChartData }> = ({ data }) => {
  if (!data || !data.slices) return (
    <Card bordered={false} className="shadow-sm h-full"><Empty description="Không có dữ liệu" /></Card>
  );

  return (
    <Card bordered={false} className="shadow-sm h-full" title={<Title level={5}>{data.title}</Title>}>
      <div className="flex flex-col justify-center h-full pb-4 space-y-5">
        {data.slices.map((slice, index) => (
          <div key={index}>
            <div className="flex justify-between items-end mb-1">
              <Text className="text-gray-600 font-medium">{slice.label}</Text>
              <Space>
                <Text strong>{slice.value}</Text>
                <Text type="secondary" className="text-xs">({slice.percentage}%)</Text>
              </Space>
            </div>
            <Progress 
              percent={slice.percentage} 
              strokeColor={slice.color} 
              showInfo={false} 
              size="small" 
              status="active"
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

// 2. Top Shops Card
export const TopShopsCard: React.FC<{ data?: ITopShopPerformer[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <Card bordered={false} className="shadow-sm h-full" title={<Title level={5}>Top Đối Tác</Title>}>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item className="!px-0 border-b last:border-0 border-gray-100 py-3">
            <List.Item.Meta
              avatar={
                <div className="relative">
                  <Avatar src={item.logoUrl} size={48} shape="square" className="bg-gray-50 border border-gray-100 object-cover" />
                  <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-sm
                    ${item.rank === 1 ? 'bg-yellow-400' : item.rank === 2 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                    {item.rank}
                  </div>
                </div>
              }
              title={<span className="font-semibold text-gray-700">{item.shopName}</span>}
              description={
                <Space size="small" split={<span className="text-gray-300">|</span>}>
                  <Text type="secondary" className="text-xs">{item.orderCount} đơn</Text>
                  <Space size={2}>
                    <span className="text-yellow-400">★</span>
                    <Text type="secondary" className="text-xs">{item.rating}</Text>
                  </Space>
                </Space>
              }
            />
            <div className="text-right">
              <div className="font-bold text-green-600 text-sm">{formatCurrency(item.revenue)}</div>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};