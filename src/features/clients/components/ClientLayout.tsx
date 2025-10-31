import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/header/Header';

const ClientLayout: React.FC = () => {
  return (
    <div className="h-full w-full bg-slate-50">
      <Header />
      
      <main className="h-full overflow-y-auto pt-16 md:pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;