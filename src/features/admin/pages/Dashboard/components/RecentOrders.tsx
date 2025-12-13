import React from 'react';
import { Card, Table, Typography, Avatar } from 'antd';
import { formatCurrency, StatusTag } from './DashboardHelpers';
import { UserOutlined, ShopOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface Props {
  data?: IRecentActivityOrder[];
}

const RecentOrders: React.FC<Props> = ({ data }) => {
  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderId',
      width: 100,
      render: (id: string) => (
        <Typography.Text copyable={{ text: id }} ellipsis className="text-gray-500 w-20 block">
          {id.substring(0, 8)}...
        </Typography.Text>
      )
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 180,
      render: (_: any, r: IRecentActivityOrder) => (
        <div className="flex items-center gap-2">
           <Avatar icon={<UserOutlined />} size="small" className="bg-blue-100 text-blue-600"/>
           <span className="font-medium text-gray-700">{r.customerName}</span>
        </div>
      )
    },
    {
      title: 'Cửa hàng',
      key: 'shop',
      width: 180,
      render: (_: any, r: IRecentActivityOrder) => (
        <div className="flex items-center gap-2">
           <ShopOutlined className="text-gray-400"/>
           <span className="text-gray-600">{r.shopName}</span>
        </div>
      )
    },
    {
      title: 'Giá trị',
      dataIndex: 'totalAmount',
      align: 'right' as const,
      width: 140,
      render: (val: number) => <span className="font-semibold text-gray-800">{formatCurrency(val)}</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center' as const,
      width: 120,
      render: (status: string) => <StatusTag status={status} />
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      align: 'right' as const,
      width: 140,
      render: (d: string) => <span className="text-gray-400 text-xs">{dayjs(d).format('DD/MM HH:mm')}</span>
    }
  ];

  return (
    <Card bordered={false} className="shadow-sm h-full" title={<Typography.Title level={5}>Giao dịch mới nhất</Typography.Title>}>
      <Table 
        rowKey="orderId"
        dataSource={data} 
        columns={columns} 
        pagination={false} 
        size="small"
        scroll={{ x: 800 }}
      />
    </Card>
  );
};

export default RecentOrders;