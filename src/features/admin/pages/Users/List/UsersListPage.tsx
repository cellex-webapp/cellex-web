import React, { useEffect, useMemo, useState } from 'react';
import { Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import UserTable from './UserTable';
import UserDetailModal from './UserDetailModal';

const UsersListPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const navigate = useNavigate();

  const { users, isLoading, error, fetchAllUsers } = useUser();

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const filteredUsers = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(kw) ||
        (u.fullName || '').toLowerCase().includes(kw)
    );
  }, [q, users]);

  const handleReload = () => {
    fetchAllUsers();
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
        onRowClick={(id: React.SetStateAction<string | null>) => {
          setDetailId(id);
          setDetailOpen(true);
        }}
      />
      <UserDetailModal
        userId={detailId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdated={handleReload} 
      />
    </div>
  );
};

export default UsersListPage;