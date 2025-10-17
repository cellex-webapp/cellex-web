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
          <Descriptions.Item label="ID">{selectedUser.id}</Descriptions.Item>
          <Descriptions.Item label="Họ và Tên">{selectedUser.fullName}</Descriptions.Item>
          <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
          <Descriptions.Item label="Vai trò" >
            <span style={{textTransform: 'capitalize'}}>{selectedUser.role}</span>
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <p>Không có dữ liệu người dùng.</p>
      )}
    </Modal>
  );
};

export default UserDetailModal;