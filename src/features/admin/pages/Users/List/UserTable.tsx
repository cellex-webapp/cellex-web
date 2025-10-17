import React from 'react';
import { Table, Tag, Button, Space } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface UserTableProps {
  data: IUser[];
  loading: boolean;
  onRowClick: (id: string) => void;
  onLock?: (id: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ data, loading, onRowClick, onLock }) => {
  const columns: ColumnsType<IUser> = [
    {
      title: 'Ảnh',
      dataIndex: 'avatarUrl',
      key: 'avatarUrl',
      render: (avatarUrl: string | undefined, record: IUser) => {
        if (avatarUrl) {
          return <img src={avatarUrl} alt={record.fullName} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />;
        }
        // fallback: initials
        const initials = (record.fullName || record.email || 'U')
          .split(' ')
          .map((s) => s.charAt(0))
          .slice(0, 2)
          .join('')
          .toUpperCase();
        return (
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 6,
            background: '#e6f7ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
          }}>
            {initials}
          </div>
        );
      },
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color="blue" style={{ textTransform: 'capitalize' }}>{role}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Ngừng'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 160,
      render: (_: any, record: IUser) => (
        <Space>
          <Button
            type="text"
            icon={<LockOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              // eslint-disable-next-line no-console
              console.log('Lock account', record.id);
              onLock?.(record.id);
            }}
          />
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
      onRow={(record) => ({
        onClick: () => onRowClick(record.id),
      })}
      rowClassName="cursor-pointer"
    />
  );
};

export default UserTable;