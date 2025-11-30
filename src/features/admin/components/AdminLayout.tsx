import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AdminSider from './AdminSider';
import AdminVendorHeader from '@/components/header/AdminVendorHeader';

const { Content } = Layout;

const AdminLayout: React.FC = () => {
  return (
    <div className="h-screen w-full">
      <AdminVendorHeader />
      <Layout hasSider className="h-full pt-14">
        <AdminSider />
        <Layout>
          <Content className="h-full overflow-auto p-4">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default AdminLayout;
