import React, { useEffect, useState } from 'react';
import { Table, Tag, Space } from 'antd';
import useShop from '@/hooks/useShop';
import VerifyShopModal from './VerifyShopModal';


const PendingShopsPage: React.FC = () => {
  const { pendingShops, fetchPendingShops, isLoading } = useShop();
  const [visible, setVisible] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  

  useEffect(() => {
    fetchPendingShops();
  }, []);

  const openModal = (shopId: string, defaultAction: 'approve' | 'reject' | null = null) => {
    setSelectedShopId(shopId);
    setVisible(true);
    setDefaultAction(defaultAction);
  };

  const [defaultAction, setDefaultAction] = useState<'approve' | 'reject' | null>(null);

  // verification is handled by VerifyShopModal

  const columns = [
    { title: 'Tên cửa hàng', dataIndex: 'shop_name', key: 'shop_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phone_number', key: 'phone_number' },
    { title: 'Trạng thái', key: 'is_verified', render: (_: any, record: any) => (<Tag color={record.is_verified ? 'green' : 'orange'}>{record.is_verified ? 'Đã duyệt' : 'Chờ duyệt'}</Tag>) },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Space className="flex items-center justify-center">
          <span className="text-indigo-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); openModal(record.id, null); }}>Xem</span>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Danh sách cửa hàng chờ duyệt</h3>
      <Table rowKey="id" loading={isLoading} dataSource={pendingShops} columns={columns} onRow={(record) => ({ onClick: () => openModal(record.id, null) })} />

      <VerifyShopModal
        visible={visible}
        shopId={selectedShopId}
        defaultAction={defaultAction}
        onClose={() => setVisible(false)}
        onSuccess={() => fetchPendingShops()}
      />
    </div>
  );
};

export default PendingShopsPage;
