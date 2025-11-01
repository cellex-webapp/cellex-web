import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Select, Button, Avatar } from 'antd';
import { SearchOutlined, ShopOutlined, FilterOutlined, EditOutlined } from '@ant-design/icons';
import useShop from '@/hooks/useShop';
import ShopFormModal from './ShopFormModal';
import ShopDetailModal from './ShopDetailModal';

const { Option } = Select;

const ShopsPage: React.FC = () => {
  const { allShops, fetchAllShops, isLoading } = useShop();
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusVerification | 'ALL'>('ALL');

  useEffect(() => {
    if (statusFilter === 'ALL') {
      fetchAllShops();
    } else {
      fetchAllShops(statusFilter);
    }
  }, [statusFilter]);

  const openDetailModal = (shopId: string) => {
    setSelectedShopId(shopId);
    setDetailVisible(true);
  };

  const openFormModal = (shopId: string) => {
    setSelectedShopId(shopId);
    setFormVisible(true);
  };

  const filteredShops = (allShops || []).filter((shop) => {
    const keyword = searchText.toLowerCase();
    return (
      shop.shop_name.toLowerCase().includes(keyword) ||
      shop.email.toLowerCase().includes(keyword) ||
      shop.phone_number.toLowerCase().includes(keyword)
    );
  });

  const getStatusText = (status: StatusVerification): string => {
    const statusMap: Record<StatusVerification, string> = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Từ chối',
    };
    return statusMap[status] || status;
  };

  const statusConfig = {
    PENDING: { color: 'warning' as const },
    APPROVED: { color: 'success' as const },
    REJECTED: { color: 'error' as const },
  };

  const columns = [
    {
      title: 'Logo',
      dataIndex: 'logo_url',
      key: 'logo_url',
      width: 80,
      render: (logo: string) =>
        logo ? (
          <Avatar size={48} src={logo} />
        ) : (
          <Avatar size={48} icon={<ShopOutlined />} style={{ backgroundColor: '#1890ff' }} />
        ),
    },
    {
      title: 'Cửa hàng',
      dataIndex: 'shop_name',
      key: 'shop_name',
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email' 
    },
    { 
      title: 'Số điện thoại', 
      dataIndex: 'phone_number', 
      key: 'phone_number' 
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <span className="text-yellow-600 font-medium">⭐ {rating?.toFixed(1) || '0.0'}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: StatusVerification) => {
        const config = statusConfig[status];
        return <Tag color={config.color}>{getStatusText(status)}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center' as const,
      render: (_: any, record: IShop) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            openFormModal(record.id);
          }}
        >
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Quản lý cửa hàng</h3>
            <p className="text-gray-500 mt-1">Danh sách tất cả các cửa hàng trong hệ thống</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">{filteredShops.length}</div>
            <div className="text-sm text-gray-500">Cửa hàng</div>
          </div>
        </div>

        <div className="mb-4 flex gap-3">
          <Input
            placeholder="Tìm kiếm theo tên, email, SĐT..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="ALL">Tất cả</Option>
            <Option value="PENDING">Chờ duyệt</Option>
            <Option value="APPROVED">Đã duyệt</Option>
            <Option value="REJECTED">Từ chối</Option>
          </Select>
        </div>

        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={filteredShops}
          columns={columns}
          onRow={(record) => ({
            onClick: () => openDetailModal(record.id),
            className: 'cursor-pointer hover:bg-gray-50',
          })}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} cửa hàng`,
          }}
        />
      </div>

      <ShopDetailModal
        visible={detailVisible}
        shopId={selectedShopId}
        onClose={() => setDetailVisible(false)}
      />

      <ShopFormModal
        visible={formVisible}
        shopId={selectedShopId}
        onClose={() => setFormVisible(false)}
        onSuccess={() => {
          if (statusFilter === 'ALL') {
            fetchAllShops();
          } else {
            fetchAllShops(statusFilter);
          }
        }}
      />
    </div>
  );
};

export default ShopsPage;
