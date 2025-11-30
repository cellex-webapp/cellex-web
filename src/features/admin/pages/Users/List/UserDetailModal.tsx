import React, { useEffect } from 'react';
import { Modal, Spin, Descriptions, message, Tag, Avatar, Space, Divider } from 'antd';
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useUser } from '@/hooks/useUser';

interface UserDetailModalProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
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
        message.error(`Lỗi tải chi tiết: ${error}`);
    }
  }, [error, open])

  const getRoleTag = (role: UserRole) => {
    const roleConfig = {
      ADMIN: { color: 'red', label: 'Admin' },
      VENDOR: { color: 'blue', label: 'Vendor' },
      USER: { color: 'green', label: 'User' },
    };
    const config = roleConfig[role] || { color: 'default', label: role };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const getStatusDisplay = () => {
    if (!selectedUser) return null;
    if (typeof selectedUser.banned === 'boolean' && selectedUser.banned) {
      return (
        <Space>
          <Tag icon={<CloseCircleOutlined />} color="error">Bị khóa</Tag>
        </Space>
      );
    }
    if (selectedUser.active) {
      return <Tag icon={<CheckCircleOutlined />} color="success">Hoạt động</Tag>;
    }
    return <Tag color="default">Ngừng</Tag>;
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          <span>Chi tiết người dùng</span>
        </Space>
      }
      open={open}
      style={{ top: 40 }}
      onCancel={onClose}
      footer={null} 
      width={800}
    >
      {isLoading ? (
        <div className="text-center p-8">
          <Spin size="large" />
        </div>
      ) : selectedUser ? (
        <>
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            {selectedUser.avatarUrl ? (
              <Avatar size={80} src={selectedUser.avatarUrl} />
            ) : (
              <Avatar size={80} style={{ backgroundColor: '#1890ff', fontSize: 28 }}>
                {((selectedUser.fullName || selectedUser.email) || 'U').split(' ').map((s) => s.charAt(0)).slice(0,2).join('').toUpperCase()}
              </Avatar>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">{selectedUser.fullName}</h3>
              <Space size="middle">
                {getRoleTag(selectedUser.role)}
                {getStatusDisplay()}
              </Space>
            </div>
          </div>

          <Divider orientation="left" orientationMargin={0}>Thông tin cơ bản</Divider>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="ID" span={2}>{selectedUser.id}</Descriptions.Item>
            <Descriptions.Item label="Họ và Tên">{selectedUser.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{selectedUser.phoneNumber}</Descriptions.Item>
            <Descriptions.Item label="Phân khúc KH">{selectedUser.customerSegmentId || '—'}</Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" orientationMargin={0}>Địa chỉ</Divider>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Địa chỉ">
              {(() => {
                const addr = selectedUser.address;
                if (!addr) return <span className="text-gray-400">Chưa cập nhật</span>;
                if (addr.fullAddress) return addr.fullAddress;
                const parts = [addr.street, addr.commune, addr.province, addr.country].filter(Boolean);
                return parts.length ? parts.join(', ') : <span className="text-gray-400">Chưa cập nhật</span>;
              })()}
            </Descriptions.Item>
          </Descriptions>

          {(selectedUser.banned || selectedUser.banReason) && (
            <>
              <Divider orientation="left" orientationMargin={0}>
                <Space>
                  <WarningOutlined className="text-red-500" />
                  <span className="text-red-500">Thông tin khóa tài khoản</span>
                </Space>
              </Divider>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Lý do khóa" span={2}>
                  {selectedUser.banReason ? (
                    <span className="text-red-600 font-medium">{selectedUser.banReason}</span>
                  ) : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Khóa lúc">
                  {selectedUser.bannedAt ? new Date(selectedUser.bannedAt).toLocaleString('vi-VN') : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Khóa bởi">{selectedUser.bannedBy || '—'}</Descriptions.Item>
              </Descriptions>
            </>
          )}

          <Divider orientation="left" orientationMargin={0}>Thông tin hệ thống</Divider>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Tạo lúc">
              {new Date(selectedUser.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lúc">
              {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString('vi-VN') : '—'}
            </Descriptions.Item>
          </Descriptions>
        </>
      ) : (
        <div className="text-center p-8 text-gray-400">
          <UserOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <p>Không có dữ liệu người dùng.</p>
        </div>
      )}
    </Modal>
  );
};

export default UserDetailModal;