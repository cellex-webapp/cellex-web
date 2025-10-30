import React, { useEffect } from 'react';
import { Modal, Spin, Descriptions, message } from 'antd';
import { useUser } from '@/hooks/useUser';

interface UserDetailModalProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, open, onClose }) => {
  const { selectedUser, isLoading, error, fetchUserById } = useUser();

  useEffect(() => {
    if (userId && open) {
      fetchUserById(userId);
    }
  }, [userId, open, fetchUserById]);
  
  useEffect(() => {
    if (error && open) {
        message.error(`Lỗi: ${error}`);
    }
  }, [error, open])

  return (
    <Modal
      title="Chi tiết người dùng"
      open={open}
      // nudge modal slightly up
      style={{ top: 40 }}
      onCancel={onClose}
      footer={null} 
      width={600}
    >
      {isLoading ? (
        <div className="text-center p-8">
          <Spin />
        </div>
      ) : selectedUser ? (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Ảnh">
            {selectedUser.avatarUrl ? (
              <img src={selectedUser.avatarUrl} alt={selectedUser.fullName} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
            ) : (
              <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e6f7ff', borderRadius: 8, fontWeight: 700 }}>
                {((selectedUser.fullName || selectedUser.email) || 'U').split(' ').map((s) => s.charAt(0)).slice(0,2).join('').toUpperCase()}
              </div>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Họ và Tên">{selectedUser.fullName}</Descriptions.Item>
          <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{selectedUser.phoneNumber}</Descriptions.Item>
          <Descriptions.Item label="Vai trò" >
            <span style={{textTransform: 'capitalize'}}>{selectedUser.role}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">{
            (typeof selectedUser.banned === 'boolean')
              ? (selectedUser.banned ? 'Bị khóa' : 'Hoạt động')
              : (selectedUser.active ? 'Hoạt động' : 'Ngừng')
          }</Descriptions.Item>
          <Descriptions.Item label="Tạo lúc">{new Date(selectedUser.createdAt).toLocaleString()}</Descriptions.Item>
        </Descriptions>
      ) : (
        <p>Không có dữ liệu người dùng.</p>
      )}
    </Modal>
  );
};

export default UserDetailModal;