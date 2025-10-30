import React, { useEffect, useMemo, useState } from 'react';
import { Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import UserTable from './UserTable';
import UserDetailModal from './UserDetailModal';
import UserBanReasonModal from './UserBanReasonModal';

const UsersListPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const navigate = useNavigate();

  const { users, isLoading, fetchAllUsers, banUser, unbanUser } = useUser();
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banTargetId, setBanTargetId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const filteredUsers = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(kw) ||
        (u.fullName || '').toLowerCase().includes(kw)
    );
  }, [q, users]);

  const handleLock = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) {
      message.error('Không tìm thấy người dùng');
      return;
    }

    const isBanned = typeof user.banned === 'boolean' ? user.banned : !user.active;

    if (!isBanned) {
      setBanTargetId(id);
      setBanModalOpen(true);
      return;
    }

    try {
      await unbanUser(id).unwrap();
      message.success('Mở khóa tài khoản thành công');
      fetchAllUsers(); 
    } catch (err: any) {
      message.error(String(err) || 'Lỗi khi mở khóa tài khoản');
    }
  };

  const handleSubmitBanReason = async (banReason: string) => {
    if (!banTargetId) return;

    try {
      await banUser({ userId: banTargetId, banReason }).unwrap();
      message.success('Khóa tài khoản thành công');
      setBanModalOpen(false);
      setBanTargetId(null);
      fetchAllUsers(); 
    } catch (err: any) {
      message.error(String(err) || 'Lỗi khi khóa tài khoản');
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Input
          placeholder="Tìm theo tên hoặc email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <Button type="primary" className="!bg-indigo-600" onClick={() => navigate('/admin/users/create')}>
          Thêm người dùng
        </Button>
      </div>
      <UserTable
        data={filteredUsers}
        loading={isLoading}
        onRowClick={(id: string) => {
          setDetailId(id);
          setDetailOpen(true);
        }}
        onLock={handleLock} 
      />
      <UserBanReasonModal
        open={banModalOpen}
        onClose={() => {
          setBanModalOpen(false);
          setBanTargetId(null);
        }}
        onSubmit={handleSubmitBanReason} 
      />
      <UserDetailModal
        userId={detailId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
};

export default UsersListPage;