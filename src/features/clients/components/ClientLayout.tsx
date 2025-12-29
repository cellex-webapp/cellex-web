import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/header/Header';
import { Layout } from 'antd';

const { Content } = Layout;

const ClientLayout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.pathname]);

  return (
    <div className="h-screen w-full">
      <Header hideSearchBar={isHomePage} />
      <Layout hasSider className="h-full pt-14">
        <Layout>
          <Content ref={contentRef} className="h-full overflow-auto p-4">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default ClientLayout;