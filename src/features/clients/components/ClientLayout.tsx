import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/header/Header';
import { Layout } from 'antd';

const { Content } = Layout;

const ClientLayout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="h-screen w-full">
      <Header hideSearchBar={isHomePage} />
      <Layout hasSider className="h-full pt-14">
        <Layout>
          <Content className="h-full overflow-auto p-4">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default ClientLayout;