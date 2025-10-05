import React, { useMemo } from 'react';
import { Table, Tag, Space, Avatar, Button, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UserSummary } from '@/types/user.type';

type Props = {
  data: UserSummary[];
  loading?: boolean;
  onRowClick?: (id: string) => void;
  onEdit?: (id: string) => void;
};

const UserTable: React.FC<Props> = ({ data, loading, onRowClick, onEdit }) => {
  const columns: ColumnsType<UserSummary> = useMemo(
    () => [
      {
        title: 'Ảnh',
        key: 'avatar',
        width: 64,
        align: 'center',
        render: (_: any, r) => (
          <Avatar size={32} src={r.avatarUrl} className="bg-indigo-600">
            {(r.fullName || r.email).charAt(0).toUpperCase()}
          </Avatar>
        ),
        responsive: ['xs', 'sm', 'md', 'lg'],
      },
      {
        title: 'Họ và tên',
        dataIndex: 'fullName',
        key: 'fullName',
        responsive: ['xs', 'sm', 'md', 'lg'],
        render: (_: any, record) => (
          <div className="min-w-0">
            <div className="font-medium truncate max-w-[180px] sm:max-w-[220px]">{record.fullName || '—'}</div>
            <div className="text-xs text-white/70 truncate max-w-[200px]">{record.email}</div>
          </div>
        ),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        ellipsis: true,
        responsive: ['md', 'lg'],
      },
      {
        title: 'Số điện thoại',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        responsive: ['sm', 'md', 'lg'],
      },
      {
        title: 'Vai trò',
        dataIndex: 'role',
        key: 'role',
        render: (r) => r,
        responsive: ['sm', 'md', 'lg'],
      },
      {
        title: 'Trạng thái',
        dataIndex: 'active',
        key: 'active',
        render: (active: boolean | undefined) => (
          <Tag color={active ? 'green' : 'red'}>{active ? 'Hoạt động' : 'Khoá'}</Tag>
        ),
        responsive: ['md', 'lg'],
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (val?: string) => (val ? new Date(val).toLocaleDateString() : '—'),
        responsive: ['lg'],
      },
      {
        title: 'Địa chỉ',
        key: 'address',
        render: (_: any, r) => (
          <Space size={4} wrap>
            {r.detailAddress && <Tag className="!m-0" color="blue-inverse">{r.detailAddress}</Tag>}
            {r.communeCode && <Tag className="!m-0" color="purple-inverse">{r.communeCode}</Tag>}
            {r.provinceCode && <Tag className="!m-0" color="geekblue-inverse">{r.provinceCode}</Tag>}
          </Space>
        ),
        responsive: ['lg'],
      },
      {
        title: 'Hành động',
        key: 'actions',
        align: 'right',
        render: (_: any, r) => (
          <Tooltip title="Sửa thông tin">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(r.id);
              }}
            />
          </Tooltip>
        ),
        responsive: ['xs', 'sm', 'md', 'lg'],
      },
    ],
    [onEdit]
  );

  return (
    <Table
      rowKey={(r) => r.id}
      columns={columns}
      dataSource={data}
      loading={loading}
      onRow={(record) => ({ onClick: () => onRowClick?.(record.id) })}
      className="[&_.ant-table]:bg-transparent [&_.ant-table-thead_th]:bg-white/5 [&_.ant-table-thead_th]:text-white/80"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default UserTable;
