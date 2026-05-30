import React, { useEffect, useState } from 'react';
import { staffService } from '@/services/staff.service';
import { Button, Card, Space, Tag } from 'antd';

const InvitationsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    const resp = await staffService.getInvitations();
    setItems(resp.result || []);
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="p-4">
      <Card title="Lời mời làm nhân viên">
        <Space direction="vertical" className="w-full" size="middle">
          {items.map((i) => (
            <div key={i.id} className="border rounded p-3 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-base font-semibold">{i.shopName || i.shopId}</div>
                  <div className="text-sm text-gray-600">Vai trò: {i.shopRoleName || i.shopRoleId}</div>
                </div>
                <Tag>{i.status}</Tag>
              </div>
              <div className="text-sm text-gray-600">
                Hết hạn: {i.expiresAt ? new Date(i.expiresAt).toLocaleString('vi-VN') : '-'}
              </div>
              <div className="flex gap-2">
                <Button onClick={async () => { await staffService.acceptInvitation(i.id); load(); }} type="primary">Chấp nhận</Button>
                <Button onClick={async () => { await staffService.declineInvitation(i.id); load(); }}>Từ chối</Button>
              </div>
            </div>
          ))}
        </Space>
      </Card>
    </div>
  );
};

export default InvitationsPage;

