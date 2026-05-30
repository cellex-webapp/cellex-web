import React, { useEffect, useState } from 'react';
import { Button, Card, Space, Table, Tag } from 'antd';
import { staffService } from '@/services/staff.service';

const StaffInvitationsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    const r = await staffService.getSentInvitations();
    setItems(r.result || []);
  };
  useEffect(() => { load(); }, []);

  return (
    <Card title="Lời mời đã gửi">
      <Table rowKey="id" dataSource={items} columns={[
        { title: 'Tên người dùng', dataIndex: 'invitedUserName', render: (v: string, r: any) => v || r.invitedUserId },
        { title: 'Email', dataIndex: 'invitedUserEmail', render: (v: string) => v || '-' },
        { title: 'Tên shop', dataIndex: 'shopName', render: (v: string, r: any) => v || r.shopId },
        { title: 'Vai trò', dataIndex: 'shopRoleName', render: (v: string, r: any) => v || r.shopRoleId },
        { title: 'Trạng thái', dataIndex: 'status', render: (v: string) => <Tag>{v}</Tag> },
        { title: 'Hết hạn', dataIndex: 'expiresAt', render: (v: string) => v ? new Date(v).toLocaleString('vi-VN') : '-' },
        { title: 'Hành động', render: (_, r: any) => r.status === 'PENDING' ? <Space><Button danger onClick={async () => { await staffService.revokeInvitation(r.id); load(); }}>Hủy</Button></Space> : null }
      ]} />
    </Card>
  );
};

export default StaffInvitationsPage;

