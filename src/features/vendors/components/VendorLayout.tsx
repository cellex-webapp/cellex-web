import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AdminVendorHeader from '@/components/header/AdminVendorHeader';
import VendorSider from './VendorSider';

const { Content } = Layout;

const VendorLayout: React.FC = () => {
  return (
    <div className="h-screen w-full">
      <AdminVendorHeader />
      <Layout hasSider className="h-full pt-14">
        <VendorSider />
        <Layout>
          <Content className="h-full overflow-auto p-4">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default VendorLayout;
