import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography, Avatar, Progress, Form, Input, theme } from 'antd';
import {
  UserOutlined,
  SolutionOutlined,
  ShopOutlined,
  NotificationOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import UserInformation from './Tabs/UserInformation';
import MyOrder from './Tabs/MyOrder';
// Vendor placeholder removed; VendorRegistration is used instead
import VendorRegistration from './Tabs/VendorRegistration';
import NotificationTab from './Tabs/Notification';
import Chat from './Tabs/Chat';
import Address from './Tabs/Address';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const PersonalInfo: React.FC<{ user?: IUser | null }> = ({ user }) => {
  const { token } = theme.useToken();

  const avatar = user?.avatarUrl;
  const name = user?.fullName || user?.email || 'Người dùng';
  const phone = user?.phoneNumber || '';
  const email = user?.email || '';

  return (
    <div className="flex w-full flex-col items-center px-4 py-2">
      <Title level={4} style={{ marginBottom: token.marginLG }}>Thông tin cá nhân</Title>
      <Avatar size={128} src={avatar} className="mb-8" />
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
          <Button type="primary" className='!bg-indigo-600' size="large" block>
            Chỉnh sửa thông tin
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};



const AccountManagementPage: React.FC = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState('personal-info');
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { token } = theme.useToken();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } finally {
      navigate('/');
    }
  }, [logout, navigate]);

  useEffect(() => {
    // Priority: query param tab, then hash fragment
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveKey(tab);
      return;
    }
    if (location.hash) {
      const hashKey = location.hash.replace('#', '');
      if (hashKey) setActiveKey(hashKey);
    }
  }, [searchParams, location.hash]);

  const menuItems = [
    { key: 'personal-info', icon: <SolutionOutlined />, label: 'Thông tin cá nhân' },
    { key: 'orders', icon: <UserOutlined />, label: 'Đơn hàng của tôi' },
    { key: 'seller-channel', icon: <ShopOutlined />, label: 'Kênh Người bán' },
    { key: 'notifications', icon: <NotificationOutlined />, label: 'Trung tâm thông báo' },
    { key: 'messages', icon: <MessageOutlined />, label: 'Trung tâm tin nhắn' },
    { key: 'addresses', icon: <EnvironmentOutlined />, label: 'Địa chỉ nhận hàng' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
  ];

  const renderContent = () => {
      switch (activeKey) {
      case 'personal-info':
        return <UserInformation user={currentUser} />;

      case 'orders':
        return <MyOrder />;

      case 'seller-channel':
        return <VendorRegistration />;

      case 'notifications':
        return <NotificationTab />;

      case 'messages':
        return <Chat />;

      case 'addresses':
        return <Address />;

      default:
        return <PersonalInfo user={currentUser} />;
    }
  };

  return (
    <div className="mx-auto h-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <Layout className="h-full flex-col gap-6 !bg-slate-50 md:flex-row">
        <Sider
          width={300}
          className="!bg-slate-50"
          breakpoint="lg"
          collapsedWidth="0"
          trigger={null}
        >
          <div className="flex h-full flex-col gap-6">
            <div className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center space-x-3 gap-3">
                    <Avatar size={48} src={currentUser?.avatarUrl || undefined} icon={!currentUser?.avatarUrl ? <UserOutlined /> : undefined} />
                    <div>
                      <Text strong className="block">{currentUser?.fullName || currentUser?.email || 'Người dùng'}</Text>
                      <Text type="secondary" className="text-xs">{currentUser?.phoneNumber || ''}</Text>
                    </div>
                  </div>
                  {(() => {
                    const u = currentUser as any;
                    const points = Number(u?.points) || 0;
                    const pointsToNextLevel = Number(u?.pointsToNextLevel) || 1000;
                    return (
                      <>
                        <Progress percent={pointsToNextLevel > 0 ? (points / pointsToNextLevel) * 100 : 0} strokeColor={token.colorPrimary} showInfo={false} className="my-3"/>
                        <Text type="secondary" className="text-xs">
                          Tích thêm {Math.max(pointsToNextLevel - points, 0)} điểm để trở thành Thành viên
                        </Text>
                      </>
                    );
                  })()}
                </div>
            <div className="flex-auto rounded-lg bg-white shadow-sm">
              <Menu
                mode="inline"
                className="h-full rounded-lg border-none"
                selectedKeys={[activeKey]}
                items={menuItems}
                onClick={({ key }) => {
                  if (key === 'logout') {
                    handleLogout();
                  } else {
                    setActiveKey(key);
                    navigate(`/account?tab=${key}#${key}`);
                    // Scroll to anchor after navigation microtask
                    setTimeout(() => {
                      const el = document.getElementById(key);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 0);
                  }
                }}
              />
            </div>
          </div>
        </Sider>

        <Content className="overflow-y-auto !bg-slate-50">
          <div className="min-h-full rounded-lg bg-white p-6 shadow-2xl ring-1 ring-black/5">
            <div id={activeKey}>
              {renderContent()}
            </div>
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default AccountManagementPage;