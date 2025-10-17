import React from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface UserTableProps {
  data: IUser[];
  loading: boolean;
  onRowClick: (id: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ data, loading, onRowClick }) => {
  const columns: ColumnsType<IUser> = [
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