import React from 'react';
import { Table, Space, Button, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface CategoryTableProps {
  data: ICategory[];
  loading: boolean;
  onEdit: (category: ICategory) => void;
  onDelete: (id: string) => void;
  onRowClick?: (id: string) => void;
  onManageAttributes?: (categorySlug: string) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({ data, loading, onEdit, onDelete, onRowClick, onManageAttributes }) => {
  const columns: ColumnsType<ICategory> = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url: string) => url ? <img src={url} alt="thumb" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} /> : null,
      width: 80,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Hoạt động' : 'Ngừng'}</Tag>
      ),
      width: 140,
    },
    {
      title: 'Danh mục cha',
      dataIndex: 'parent',
      key: 'parent',
      width: 200,
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onManageAttributes && onManageAttributes((record as any).slug);
            }}
            title="Quản lý thuộc tính"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(record);
            }}
            title="Chỉnh sửa"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record.id);
            }}
            title="Xóa"
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      className='cursor-pointer'
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      onRow={(record) => ({
        onClick: () => onRowClick && onRowClick(record.id),
      })}
    />
  );
};

export default CategoryTable;