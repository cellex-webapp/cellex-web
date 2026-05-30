import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AdminVendorHeader from '@/components/header/AdminVendorHeader';
import VendorSider from './VendorSider';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useState } from 'react';
import { staffService } from '@/services/staff.service';

const { Content } = Layout;

const VendorLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const [staffPermissions, setStaffPermissions] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('staffPermissions') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const loadStaffContext = async () => {
      if (currentUser?.role !== 'STAFF') {
        localStorage.removeItem('staffPermissions');
        localStorage.removeItem('staffShopId');
        setStaffPermissions([]);
        return;
      }
      try {
        const resp = await staffService.getMyShop();
        const permissions = resp.result.permissions || [];
        localStorage.setItem('staffPermissions', JSON.stringify(permissions));
        localStorage.setItem('staffShopId', resp.result.shopId || '');
        setStaffPermissions(permissions);
      } catch {
        localStorage.setItem('staffPermissions', JSON.stringify([]));
        setStaffPermissions([]);
      }
    };
    loadStaffContext();
  }, [currentUser?.role]);

  return (
    <div className="h-screen w-full">
      <AdminVendorHeader />
      <Layout hasSider className="h-full pt-14">
        <VendorSider staffPermissions={staffPermissions} />
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
