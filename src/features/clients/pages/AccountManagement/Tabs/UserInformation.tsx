import React from 'react';
import { Avatar, Button, Form, Input, Typography, theme } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const UserInformation: React.FC<{ user?: IUser | null }> = ({ user }) => {
  const { token } = theme.useToken();

  const avatar = user?.avatarUrl;
  const name = user?.fullName || user?.email || 'Người dùng';
  const phone = user?.phoneNumber || '';
  const email = user?.email || '';

  return (
    <div className="flex w-full flex-col items-center px-4 py-2">
      <Title level={4} style={{ marginBottom: token.marginLG }}>Thông tin cá nhân</Title>
  <Avatar size={128} src={avatar || undefined} icon={!avatar ? <UserOutlined /> : undefined} className="mb-8" />
      <Form layout="vertical" style={{ maxWidth: '450px', width: '100%' }}>
        <Form.Item label={<Text strong>Họ và tên</Text>}>
          <Input size="large" value={name} readOnly className="!bg-white" />
        </Form.Item>
        <Form.Item label={<Text strong>Số điện thoại</Text>}>
          <Input size="large" value={phone} readOnly className="!bg-white" />
        </Form.Item>
        <Form.Item label={<Text strong>Email</Text>}>
          <Input size="large" value={email} readOnly className="!bg-white" />
        </Form.Item>
        <Form.Item className="mt-4">
          <Button type="primary" size="large" block>
            Chỉnh sửa thông tin
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserInformation;
