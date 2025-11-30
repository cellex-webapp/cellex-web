import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/header/Header';

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
