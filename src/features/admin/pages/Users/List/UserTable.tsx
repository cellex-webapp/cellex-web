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
      width: 72,
      responsive: ['xs', 'sm', 'md'],
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
      width: 200,
      responsive: ['xs', 'sm', 'md', 'lg'],
      ellipsis: { showTitle: false },
      render: (text: string) => <div style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={text}>{text}</div>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      responsive: ['sm', 'md', 'lg'],
      ellipsis: { showTitle: false },
      render: (text: string) => <div style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={text}>{text}</div>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 140,
      responsive: ['md', 'lg'],
      ellipsis: { showTitle: false },
      render: (text: string) => <div style={{ maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={text}>{text}</div>,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      responsive: ['md', 'lg'],
      render: (role: string) => <Tag color="blue" style={{ textTransform: 'capitalize' }}>{role}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      width: 100,
      responsive: ['sm', 'md', 'lg'],
      render: (isActive: boolean, record: IUser) => {
        const isBanned = typeof record.banned === 'boolean' ? record.banned : !isActive;
        if (isBanned) {
          return (
            <Tag color="red">Bị khóa</Tag>
          );
        }
        return (
          <Tag color={isActive ? 'green' : 'red'}>
            {isActive ? 'Hoạt động' : 'Ngừng'}
          </Tag>
        );
      },
    },
    {
      title: 'Lý do khóa',
      dataIndex: 'banReason',
      key: 'banReason',
      width: 240,
      responsive: ['lg', 'xl'],
      ellipsis: { showTitle: false },
      render: (reason: string | undefined) => (
        reason && reason.trim() ? (
          <div style={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={reason}>
            {reason}
          </div>
        ) : (
          '-'
        )
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 120,
      render: (_: any, record: IUser) => {
        const isBanned = typeof record.banned === 'boolean' ? record.banned : !record.active;
        return (
          <Space>
            <Tooltip title={isBanned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}>
              <Button
                type="text"
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
      scroll={{ x: 1000 }}
      rowKey="id"
      onRow={(record) => ({
        onClick: () => onRowClick(record.id),
      })}
      rowClassName="cursor-pointer"
    />
  );
};

export default UserTable;