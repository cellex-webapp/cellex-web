import React, { useEffect, useState, useCallback } from 'react';
import { Input, Button, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { useDebounce } from '@/hooks/useDebounce'; 
import UserTable from './UserTable';
import UserDetailModal from './UserDetailModal';
import UserBanReasonModal from './UserBanReasonModal';
import { useChat } from '@/hooks/useChat';

const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    users, 
    isLoading, 
    error, 
    pagination, 
    fetchAllUsers, 
    banUser, 
    unbanUser 
  } = useUser();
  const { startChatWithUser } = useChat();
  
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 350); 
  
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banTargetId, setBanTargetId] = useState<string | null>(null);

  const refreshCurrentList = useCallback(() => {
    fetchAllUsers({ 
      page: pagination.page, 
      limit: pagination.limit, 
      search: debouncedQ 
    });
  }, [fetchAllUsers, pagination.page, pagination.limit, debouncedQ]);

  useEffect(() => {
    refreshCurrentList();
  }, [refreshCurrentList]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleChat = async (userId: string) => {
    try {
      const room = await startChatWithUser(userId);
      if (room) {
        navigate('/admin/customers/messages'); 
      } else {
        message.error('Không thể tạo cuộc trò chuyện');
      }
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi kết nối đến chat');
    }
  };

  const handleLock = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) {
      message.error('Không tìm thấy người dùng');
      return;
    }

    const isBanned = user.banned; 

    if (!isBanned) {
      setBanTargetId(id);
      setBanModalOpen(true);
      return;
    }

    try {
      await unbanUser(id).unwrap();
      message.success('Mở khóa tài khoản thành công');
      refreshCurrentList(); 
    } catch (err: any) {
      message.error(typeof err === 'string' ? err : 'Lỗi khi mở khóa tài khoản');
    }
  };

  const handleSubmitBanReason = async (banReason: string) => {
    if (!banTargetId) return;

    try {
      await banUser({ userId: banTargetId, banReason }).unwrap();
      message.success('Khóa tài khoản thành công');
      setBanModalOpen(false);
      setBanTargetId(null);
      refreshCurrentList(); 
    } catch (err: any) {
      message.error(typeof err === 'string' ? err : 'Lỗi khi khóa tài khoản');
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Input
          placeholder="Tìm theo tên hoặc email"
          prefix={<SearchOutlined />}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
          allowClear
        />
        <Button type="primary" className="!bg-indigo-600" onClick={() => navigate('/admin/users/create')}>
          Thêm người dùng
        </Button>
      </div>
      
      <UserTable
        data={users}
        loading={isLoading}
        // TODO: implement pagination in UserTable
        onRowClick={(id: string) => {
          setDetailId(id);
          setDetailOpen(true);
        }}
        onLock={handleLock} 
        onChat={handleChat}
      />
      
      <UserBanReasonModal
        open={banModalOpen}
        onClose={() => { setBanModalOpen(false); setBanTargetId(null); }}
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