import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/header/Header';
import CompareWidget from '@/components/CompareWidget/CompareWidget';
import { useProduct } from '@/hooks/useProduct';
import { Layout } from 'antd';

const { Content } = Layout;

const ClientLayout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { compareList } = useProduct();
  const hasCompareWidget = compareList.length > 0;

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
          <Content
            ref={contentRef}
            className={`h-full overflow-auto p-4 ${hasCompareWidget ? 'pb-40 md:pb-32' : ''}`}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
      <CompareWidget />
    </div>
  );
};

export default ClientLayout;