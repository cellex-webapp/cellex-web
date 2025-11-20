import React, { useEffect, useCallback, useState } from 'react';
import { Table, Tag, Space, Input, Button, Avatar } from 'antd';
import { SearchOutlined, ShopOutlined } from '@ant-design/icons';
import useShop from '@/hooks/useShop';
import { useDebounce } from '@/hooks/useDebounce';
import VerifyShopModal from './VerifyShopModal';
import type { TablePaginationConfig } from 'antd/es/table';

const PendingShopsPage: React.FC = () => {
  const { shops, pagination, isLoading, fetchShops } = useShop();
  const [visible, setVisible] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [defaultAction, setDefaultAction] = useState<'approve' | 'reject' | null>(null);
  
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 350);

  const loadPendingShops = useCallback(() => {
      fetchShops({
          status: 'PENDING',
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch,
          sortBy: 'createdAt',
          sortType: 'desc'
      });
  }, [fetchShops, pagination.page, pagination.limit, debouncedSearch]);

  useEffect(() => {
      fetchShops({ status: 'PENDING', page: 1, limit: pagination.limit, search: debouncedSearch });
  }, [debouncedSearch, fetchShops]); 

  const handleTableChange = (newPagination: TablePaginationConfig) => {
      fetchShops({
          status: 'PENDING',
          page: newPagination.current,
          limit: newPagination.pageSize,
          search: debouncedSearch
      });
  };

  const openModal = (shopId: string, action: 'approve' | 'reject' | null = null) => {
    setSelectedShopId(shopId);
    setDefaultAction(action);
    setVisible(true);
  };

  const columns: any = [
    {
      title: 'Logo',
      dataIndex: 'logo_url',
      width: 80,
      render: (logo: string) => logo ? <Avatar src={logo} shape="square" size={48}/> : <Avatar icon={<ShopOutlined />} shape="square" size={48} className="bg-orange-200 text-orange-600" />,
    },
    { title: 'Tên cửa hàng', dataIndex: 'shop_name', key: 'shop_name', render: (t: string) => <span className="font-medium">{t}</span> },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'SĐT', dataIndex: 'phone_number', key: 'phone_number' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: () => <Tag color="orange">Chờ duyệt</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: IShop) => (
        <Space>
          <Button type="primary" size="small" ghost onClick={(e) => { e.stopPropagation(); openModal(record.id, 'approve'); }}>Duyệt</Button>
          <Button type="text" size="small" onClick={(e) => { e.stopPropagation(); openModal(record.id, null); }}>Chi tiết</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-lg font-semibold">Yêu cầu mở gian hàng</div>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 300 }}
          allowClear
        />
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={shops}
        columns={columns}
        onRow={(record) => ({ 
            onClick: () => openModal(record.id, null), 
            className: 'cursor-pointer hover:bg-gray-50' 
        })}
        pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (t) => `Tổng ${t} yêu cầu`
        }}
        onChange={handleTableChange}
      />

      <VerifyShopModal 
        visible={visible} 
        shopId={selectedShopId} 
        defaultAction={defaultAction} 
        onClose={() => setVisible(false)} 
        onSuccess={() => loadPendingShops()} 
      />
    </div>
  );
};

export default PendingShopsPage;