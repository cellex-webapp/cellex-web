import React, { useEffect, useMemo, useState } from 'react';
import { Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '@/services/userApi';
import type { UserSummary } from '@/types/user.type';
import UserTable from '../components/UserTable';
import UserDetailModal from '../components/UserDetailModal';

const UsersListPage: React.FC = () => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      try {
  const list = await getUsers();
  if (isMounted) setUsers(list);
      } catch (e: any) {
        message.error(e?.message || 'Không thể tải danh sách người dùng');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(kw) ||
        (u.fullName || '').toLowerCase().includes(kw) ||
        (u.phoneNumber || '').toLowerCase().includes(kw)
    );
  }, [q, users]);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Input
          placeholder="Tìm theo tên, email, SĐT"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <Button type="primary" className="!bg-indigo-600" onClick={() => navigate('/admin/users/create')}>
          Thêm người dùng
        </Button>
      </div>
      <UserTable
        data={filtered}
        loading={loading}
        onRowClick={(id) => {
          setDetailId(id);
          setDetailOpen(true);
        }}
        onEdit={(id) => {
          setDetailId(id);
          setDetailOpen(true);
        }}
      />
      <UserDetailModal
        userId={detailId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdated={async () => {
          try {
            const list = await getUsers();
            setUsers(list);
          } catch {
            // ignore
          }
        }}
      />
    </div>
  );
};

export default UsersListPage;
