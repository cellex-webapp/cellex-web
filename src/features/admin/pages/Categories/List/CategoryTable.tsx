import React from 'react';
import { Table, Space, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface CategoryTableProps {
  data: ICategory[];
  loading: boolean;
  onEdit: (category: ICategory) => void;
  onDelete: (id: string) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({ data, loading, onEdit, onDelete }) => {
  const columns: ColumnsType<ICategory> = [
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
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => onEdit(record)}>Chỉnh sửa</Button>
          <Button type="link" danger onClick={() => onDelete(record.id)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
    />
  );
};

export default CategoryTable;