import React, { useMemo } from 'react';
import { Table, Image, Tag, Space, Button, Popconfirm, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { AppCategory } from '@/types/category.type';

type Props = {
  data: AppCategory[];
  loading?: boolean;
  onEdit?: (cat: AppCategory) => void;
  onDelete?: (id: string) => Promise<void> | void;
};

const CategoryTable: React.FC<Props> = ({ data, loading, onEdit, onDelete }) => {
  const columns: ColumnsType<AppCategory> = useMemo(
    () => [
      {
        title: 'Ảnh',
        key: 'image',
        width: 80,
        align: 'center',
        render: (_: any, r) => (
          r.imageUrl ? (
            <Image src={r.imageUrl} width={48} height={48} className="rounded-md object-cover" preview={false} />
          ) : (
            <div className="w-12 h-12 rounded-md bg-white/10" />
          )
        ),
        responsive: ['xs', 'sm', 'md', 'lg'],
      },
      { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
      {
        title: 'Danh mục cha',
        key: 'parent',
        render: (_: any, r) => r.parent?.name || '—',
        responsive: ['sm', 'md', 'lg'],
      },
      {
        title: 'Trạng thái',
        key: 'active',
        render: (_: any, r) => (
          <Tag color={r.active ? 'green' : 'red'}>{r.active ? 'Hoạt động' : 'Ngừng'}</Tag>
        ),
        responsive: ['sm', 'md', 'lg'],
      },
      {
        title: 'Hành động',
        key: 'actions',
        align: 'right',
        render: (_: any, r) => (
          <Space>
            <Tooltip title="Sửa">
              <Button type="text" icon={<EditOutlined />} onClick={() => onEdit?.(r)} />
            </Tooltip>
            <Popconfirm
              title="Xoá danh mục"
              description={`Bạn chắc chắn xoá "${r.name}"?`}
              onConfirm={() => onDelete?.(r.id)}
              okText="Xoá"
              cancelText="Huỷ"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [onDelete, onEdit]
  );

  return (
    <Table<AppCategory>
      rowKey={(r) => r.id}
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 10 }}
      className="[&_.ant-table]:bg-transparent [&_.ant-table-thead_th]:bg-white/5 [&_.ant-table-thead_th]:text-white/80"
    />
  );
};

export default CategoryTable;
