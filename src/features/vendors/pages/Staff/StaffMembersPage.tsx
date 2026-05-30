import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, List, Modal, Select, Space, Table, message } from 'antd';
import { staffService } from '@/services/staff.service';

const StaffMembersPage: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>();
  const [selectedRole, setSelectedRole] = useState<string>();
  const [changeRoleUser, setChangeRoleUser] = useState<any | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    const [m, r] = await Promise.all([staffService.getMembers(), staffService.getRoles()]);
    setMembers(m.result || []);
    setRoles(r.result || []);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!search.trim()) return setUsers([]);
      const r = await staffService.searchUsers(search.trim());
      setUsers(r.result || []);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <Card title="Danh sách nhân viên" extra={<Button type="primary" onClick={() => setInviteOpen(true)}>Mời nhân viên</Button>}>
      <Table rowKey="userId" dataSource={members} columns={[
        { title: 'Tên', dataIndex: 'fullName' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Vai trò', dataIndex: 'role' },
        { title: 'Ngày vào', dataIndex: 'joinedAt', render: (v: string) => v ? new Date(v).toLocaleString('vi-VN') : '-' },
        { title: 'Trạng thái', render: (_, r: any) => r.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động' },
        {
          title: 'Hành động',
          render: (_, r: any) => (
            <Space>
              <Button onClick={() => setChangeRoleUser(r)}>Đổi vai trò</Button>
              <Button danger onClick={async () => { await staffService.removeMember(r.userId); message.success('Đã thu hồi quyền'); load(); }}>Thu hồi</Button>
            </Space>
          )
        }
      ]} />

      <Modal open={inviteOpen} onCancel={() => setInviteOpen(false)} onOk={async () => {
        if (!selectedUser || !selectedRole) return;
        await staffService.invite({ userId: selectedUser, shopRoleId: selectedRole });
        message.success('Đã gửi lời mời');
        setInviteOpen(false);
      }} title="Mời nhân viên">
        <Form form={form} layout="vertical">
          <Form.Item label="Tìm người dùng">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} />
            <List
              bordered
              dataSource={users}
              renderItem={(u: any) => (
                <List.Item onClick={() => setSelectedUser(u.id)} style={{ cursor: 'pointer', background: selectedUser === u.id ? '#f0f5ff' : undefined }}>
                  {u.fullName} - {u.email}
                </List.Item>
              )}
            />
          </Form.Item>
          <Form.Item label="Vai trò">
            <Select value={selectedRole} onChange={setSelectedRole} options={roles.map(r => ({ value: r.id, label: r.name }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={!!changeRoleUser} onCancel={() => setChangeRoleUser(null)} onOk={async () => {
        if (!changeRoleUser || !selectedRole) return;
        await staffService.updateMemberRole(changeRoleUser.userId, selectedRole);
        message.success('Đã đổi vai trò');
        setChangeRoleUser(null);
        load();
      }} title="Đổi vai trò nhân viên">
        <Select style={{ width: '100%' }} value={selectedRole} onChange={setSelectedRole} options={roles.map(r => ({ value: r.id, label: r.name }))} />
      </Modal>
    </Card>
  );
};

export default StaffMembersPage;

