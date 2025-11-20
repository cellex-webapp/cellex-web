import React, { useCallback, useEffect, useState } from 'react';
import { Table, Tag, Input, Select, Button, Avatar, message } from 'antd';
import { SearchOutlined, ShopOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import useShop from '@/hooks/useShop';
import { useDebounce } from '@/hooks/useDebounce';
import ShopFormModal from './ShopFormModal';
import ShopDetailModal from './ShopDetailModal';
import type { TablePaginationConfig } from 'antd/es/table';

const { Option } = Select;

const ShopsPage: React.FC = () => {
  const { 
    shops: allShops, 
    pagination, 
    isLoading, 
    error,
    fetchShops 
  } = useShop();

  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 350);
  const [statusFilter, setStatusFilter] = useState<StatusVerification | undefined>(undefined);

  const loadShops = useCallback(() => {
    fetchShops({
      page: pagination.page, 
      limit: pagination.limit,
      status: statusFilter,
      search: debouncedSearchText,
      sortBy: 'createdAt',
      sortType: 'desc'
    });
  }, [fetchShops, pagination.page, pagination.limit, statusFilter, debouncedSearchText]);

  useEffect(() => {
    fetchShops({
        page: 1,
        limit: pagination.limit,
        status: statusFilter,
        search: debouncedSearchText
    });
  }, [statusFilter, debouncedSearchText, fetchShops]); 

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchShops({
        page: newPagination.current,
        limit: newPagination.pageSize,
        status: statusFilter,
        search: debouncedSearchText
    });
  };

  const openDetailModal = (shopId: string) => {
    setSelectedShopId(shopId);
    setDetailVisible(true);
  };

  const openFormModal = (shopId: string) => {
    setSelectedShopId(shopId);
    setFormVisible(true);
  };

  const getStatusTag = (status: StatusVerification) => {
    const config = {
      PENDING: { color: 'orange', text: 'Chờ duyệt' },
      APPROVED: { color: 'green', text: 'Đã duyệt' },
      REJECTED: { color: 'red', text: 'Từ chối' },
    };
    const { color, text } = config[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const columns: any = [
    {
      title: 'Logo',
      dataIndex: 'logo_url',
      key: 'logo_url',
      width: 80,
      render: (logo: string) => logo ? <Avatar src={logo} size={40} /> : <Avatar icon={<ShopOutlined />} size={40} />,
    },
    {
      title: 'Cửa hàng',
      dataIndex: 'shop_name',
      key: 'shop_name',
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'SĐT', dataIndex: 'phone_number', key: 'phone_number' },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => <span className="text-yellow-600">⭐ {rating?.toFixed(1) || '0.0'}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: StatusVerification) => getStatusTag(status),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_: any, record: IShop) => (
        <div className="flex justify-center gap-2">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={(e) => { e.stopPropagation(); openDetailModal(record.id); }} />
            <Button type="text" size="small" icon={<EditOutlined className="text-blue-500"/>} onClick={(e) => { e.stopPropagation(); openFormModal(record.id); }} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-3 items-center flex-wrap">
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 300 }}
          allowClear
        />
        <Select 
            value={statusFilter} 
            onChange={setStatusFilter} 
            style={{ width: 180 }} 
            placeholder="Lọc theo trạng thái"
            allowClear
        >
          <Option value="PENDING">Chờ duyệt</Option>
          <Option value="APPROVED">Đã duyệt</Option>
          <Option value="REJECTED">Từ chối</Option>
        </Select>
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={allShops}
        columns={columns}
        onRow={(record) => ({ 
            onClick: () => openDetailModal(record.id), 
            className: 'cursor-pointer hover:bg-gray-50' 
        })}
        pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} cửa hàng`
        }}
        onChange={handleTableChange}
      />

      <ShopDetailModal 
        visible={detailVisible} 
        shopId={selectedShopId} 
        onClose={() => setDetailVisible(false)} 
      />

      <ShopFormModal
        visible={formVisible}
        shopId={selectedShopId}
        onClose={() => setFormVisible(false)}
        onSuccess={() => loadShops()} 
      />
    </div>
  );
};

export default ShopsPage;