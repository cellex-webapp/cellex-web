import React, { useEffect, useMemo, useState } from 'react';
import { Input, Table, Tag, Avatar } from 'antd';
import { SearchOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useCategory } from '@/hooks/useCategory';
import CategoryDetailModal from '@/features/admin/pages/Categories/List/CategoryDetailModal';

const VendorCategoriesPage: React.FC = () => {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [q, setQ] = useState('');

  const { categories, isLoading, fetchAllCategories } = useCategory();

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const filteredCategories = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(kw));
  }, [q, categories]);

  const handleOpenDetail = (id: string) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailId(null);
    setDetailOpen(false);
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      render: (imageUrl: string) => (
        imageUrl ? (
          <Avatar size={64} src={imageUrl} shape="square" />
        ) : (
          <Avatar size={64} icon={<AppstoreOutlined />} shape="square" style={{ backgroundColor: '#1890ff' }} />
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
      title: 'Danh mục cha',
      dataIndex: 'parent',
      key: 'parent',
      render: (parent: ICategory | null) => (
        parent ? (
          <Tag color="blue">{parent.name}</Tag>
        ) : (
          <Tag>Danh mục gốc</Tag>
        )
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4">
        <Input
          placeholder="Tìm theo tên danh mục..."
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
        dataSource={filteredCategories}
        columns={columns}
        onRow={(record) => ({ onClick: () => handleOpenDetail(record.id), className: 'cursor-pointer hover:bg-gray-50' })}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} danh mục` }}
      />

      <CategoryDetailModal categoryId={detailId} open={detailOpen} onClose={handleCloseDetail} />
    </div>
  );
};

export default VendorCategoriesPage;
