import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Input, Button } from 'antd';
import { SearchOutlined, ShopOutlined } from '@ant-design/icons';
import useShop from '@/hooks/useShop';
import VerifyShopModal from './VerifyShopModal';

const PendingShopsPage: React.FC = () => {
  const { pendingShops, fetchPendingShops, isLoading } = useShop();
  const [visible, setVisible] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [defaultAction, setDefaultAction] = useState<'approve' | 'reject' | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchPendingShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (shopId: string, action: 'approve' | 'reject' | null = null) => {
    setSelectedShopId(shopId);
    setDefaultAction(action);
    setVisible(true);
  };

  const filteredShops = (pendingShops || []).filter((shop) => {
    const keyword = searchText.toLowerCase();
    return (
      shop.shop_name.toLowerCase().includes(keyword) ||
      shop.email.toLowerCase().includes(keyword) ||
      shop.phone_number.toLowerCase().includes(keyword)
    );
  });

  const columns = [
    {
      title: 'Logo',
      dataIndex: 'logo_url',
      key: 'logo_url',
      width: 80,
      render: (logo: string, record: IShop) => (
        logo ? (
          <img src={logo} alt={record.shop_name} className="w-12 h-12 object-cover rounded" />
        ) : (
          <div className="w-12 h-12 bg-indigo-100 rounded flex items-center justify-center">
            <ShopOutlined className="text-indigo-600 text-xl" />
          </div>
        )
      ),
    },
    { title: 'Tên cửa hàng', dataIndex: 'shop_name', key: 'shop_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phone_number', key: 'phone_number' },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: IShop) => {
        const statusConfig = {
          PENDING: { color: 'orange', text: 'Chờ duyệt' },
          APPROVED: { color: 'green', text: 'Đã duyệt' },
          REJECTED: { color: 'red', text: 'Từ chối' },
        };
        const config = statusConfig[record.status] || { color: 'default', text: record.status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: IShop) => (
        <Space>
          <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); openModal(record.id, null); }}>
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-3">
        <Input
          placeholder="Tìm kiếm theo tên, email, SĐT..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 400 }}
          allowClear
        />
        <div className="ml-auto text-sm text-gray-500">{filteredShops.length} cửa hàng</div>
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={filteredShops}
        columns={columns}
        onRow={(record) => ({ onClick: () => openModal(record.id, null), className: 'cursor-pointer hover:bg-gray-50' })}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} cửa hàng` }}
      />

      <VerifyShopModal visible={visible} shopId={selectedShopId} defaultAction={defaultAction} onClose={() => setVisible(false)} onSuccess={() => fetchPendingShops()} />
    </div>
  );
};

export default PendingShopsPage;
