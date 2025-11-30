import React from 'react';
import { Table, Tag, Button, Space, Tooltip } from 'antd';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
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
      width: 60,
      responsive: ['xs', 'sm', 'md'],
      render: (avatarUrl: string | undefined, record: IUser) => {
        if (avatarUrl) {
          return <img src={avatarUrl} alt={record.fullName} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />;
        }
        const initials = (record.fullName || record.email || 'U')
          .split(' ')
          .map((s) => s.charAt(0))
          .slice(0, 2)
          .join('')
          .toUpperCase();
        return (
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            background: '#e6f7ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '13px',
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
      width: 150,
      responsive: ['xs', 'sm', 'md', 'lg'],
      ellipsis: true,
      render: (text: string) => <span title={text}>{text}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      responsive: ['sm', 'md', 'lg'],
      ellipsis: true,
      render: (text: string) => <span title={text}>{text}</span>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 120,
      responsive: ['md', 'lg'],
      ellipsis: true,
      render: (text: string) => <span title={text}>{text}</span>,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 90,
      responsive: ['md', 'lg'],
      ellipsis: true,
      render: (role: string) => <Tag color="blue" style={{ textTransform: 'capitalize', margin: 0 }}>{role}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      width: 95,
      responsive: ['sm', 'md', 'lg'],
      ellipsis: true,
      render: (isActive: boolean, record: IUser) => {
        const isBanned = typeof record.banned === 'boolean' ? record.banned : !isActive;
        if (isBanned) {
          return (
            <Tag color="red" style={{ margin: 0 }}>Bị khóa</Tag>
          );
        }
        return (
          <Tag color={isActive ? 'green' : 'red'} style={{ margin: 0 }}>
            {isActive ? 'Hoạt động' : 'Ngừng'}
          </Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 90,
      fixed: 'right',
      render: (_: any, record: IUser) => {
        const isBanned = typeof record.banned === 'boolean' ? record.banned : !record.active;
        return (
          <Space size="small">
            <Tooltip title={isBanned ? 'Mở khóa' : 'Khóa'}>
              <Button
                type="text"
                size="small"
                icon={isBanned ? <UnlockOutlined /> : <LockOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onLock?.(record.id);
                }}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 10 }}
      scroll={{ x: 800 }}
      rowKey="id"
      onRow={(record) => ({
        onClick: () => onRowClick(record.id),
      })}
      rowClassName="cursor-pointer"
      size="middle"
    />
  );
};

export default UserTable;