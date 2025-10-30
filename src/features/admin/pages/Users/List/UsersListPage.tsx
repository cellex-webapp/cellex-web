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

  const { users, isLoading, error, fetchAllUsers, banUser, unbanUser } = useUser();
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banTargetId, setBanTargetId] = useState<string | null>(null);

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
        onRowClick={(id: string) => {
          setDetailId(id);
          setDetailOpen(true);
        }}
        onLock={(id: string) => {
          const user = users.find((u) => u.id === id);
          if (!user) {
            message.error('Không tìm thấy người dùng');
            return;
          }
  
          const isBanned = typeof user.banned === 'boolean' ? user.banned : !user.active;
  
          if (!isBanned) {
            // Open ban modal to collect reason
            setBanTargetId(id);
            setBanModalOpen(true);
            return;
          }
  
          // if banned -> unban immediately
          (async () => {
            try {
              // prefer unwrap when available
              // @ts-ignore
              const result = await unbanUser(id).unwrap?.();
              console.log('unban result', result);
              message.success('Mở khóa tài khoản thành công');
              fetchAllUsers();
            } catch (e: any) {
              // fallback: try to inspect returned action if unwrap not available
              try {
                const res: any = await unbanUser(id);
                if (res?.meta?.requestStatus === 'fulfilled') {
                  message.success('Mở khóa tài khoản thành công');
                  fetchAllUsers();
                } else {
                  const err = res?.payload ?? res?.error?.message ?? 'Lỗi khi mở khóa tài khoản';
                  message.error(err as string);
                }
              } catch (err2: any) {
                message.error(e?.message ?? 'Lỗi');
              }
            }
          })();
        }}
      />
      <UserBanReasonModal
        open={banModalOpen}
        onClose={() => {
          setBanModalOpen(false);
          setBanTargetId(null);
        }}
        onSubmit={async (banReason: string) => {
          if (!banTargetId) return;
          try {
            const res: any = await banUser({ userId: banTargetId, banReason });
            if (res?.meta?.requestStatus === 'fulfilled') {
              message.success('Khóa tài khoản thành công');
              setBanModalOpen(false);
              setBanTargetId(null);
              fetchAllUsers();
            } else {
              const err = res?.payload ?? res?.error?.message ?? 'Lỗi khi khóa tài khoản';
              message.error(err as string);
            }
          } catch (e: any) {
            message.error(e?.message ?? 'Lỗi');
          }
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