import React, { useEffect, useState } from 'react';
import { Input, Table, Tag, Avatar } from 'antd';
import { SearchOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useCategory } from '@/hooks/useCategory';
import { useDebounce } from '@/hooks/useDebounce';
import CategoryDetailModal from '@/features/admin/pages/Categories/List/CategoryDetailModal';
import type { ColumnsType } from 'antd/es/table';

const VendorCategoriesPage: React.FC = () => {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 350);

  const { categories, isLoading, fetchAllCategories } = useCategory();

  useEffect(() => {
    fetchAllCategories({ search: debouncedQ });
  }, [fetchAllCategories, debouncedQ]);

  const handleOpenDetail = (id: string) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const columns: ColumnsType<ICategory> = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      render: (imageUrl: string) => (
        imageUrl ? (
          <Avatar size={48} src={imageUrl} shape="square" />
        ) : (
          <Avatar size={48} icon={<AppstoreOutlined />} shape="square" className="bg-blue-500" />
        )
      ),
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => desc || '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Hoạt động' : 'Ẩn'}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4">
        <Input
          placeholder="Tìm danh mục..."
          prefix={<SearchOutlined />}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
          allowClear
        />
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={categories}
        columns={columns}
        onRow={(record) => ({ 
          onClick: () => handleOpenDetail(record.id), 
          className: 'cursor-pointer hover:bg-gray-50' 
        })}
        pagination={{ pageSize: 10 }} 
      />

      <CategoryDetailModal 
        categoryId={detailId} 
        open={detailOpen} 
        onClose={() => { setDetailId(null); setDetailOpen(false); }} 
      />
    </div>
  );
};

export default VendorCategoriesPage;